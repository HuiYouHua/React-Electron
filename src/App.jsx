import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

import SearchFile from './components/search-file';
import FileList from './components/file-list';
import ButtonItem from './components/button-item';
import Tablist from './components/tab-list';
import {
  mapArr,
  objToArr,
  readFile,
  writeFile,
  renameFile,
  deleteFile,
} from './utils/helper';
import useIpcRenderer from './hooks/useIpcRenderer';

const path = window.require('path');
const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');

const fileStore = new Store({ name: 'filesInfo' });

// 将文件持久化
const saveInfoToStore = (files) => {
  const storeObj = objToArr(files).reduce((ret, file) => {
    const { id, title, createTime, path } = file;
    ret[id] = {
      id,
      path,
      title,
      createTime,
    };
    return ret;
  }, {});
  fileStore.set('files', storeObj);
};

let LeftDiv = styled.div`
  position: relative;
  background-color: #7b8c7c;
  min-height: 100vh;
  padding: 0;

  .btn_list {
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    p {
      border: 0;
      width: 50%;
      color: #fff;
      border-radius: 0;
      margin-bottom: 0 !important;
    }
    p:nth-of-type(1) {
      background-color: #8ba39e;
    }
    p:nth-of-type(2) {
      background-color: #98b4b3;
    }
  }
`;

let RightDiv = styled.div`
  background-color: #9cd8cd;

  .init-page {
    color: #888;
    text-align: center;
    font: normal 28px/300px '微软雅黑';
  }
`;

function App() {
  // 所有的文件信息
  const [files, setFiles] = useState(fileStore.get('files') || []);
  // 当前正在编辑的文件id
  const [activeId, setActiveId] = useState('');
  // 当前一打开的文件信息 ids
  const [openIds, setOpenIds] = useState([]);
  // 当前未被保存的所有文件信息 ids
  const [unSavaIds, setUnSavaIds] = useState([]);
  const [searchFiles, setSearchFiles] = useState([]);

  // 自定义一个当前磁盘里存放的文件路径
  const savedPath = remote.app.getPath('documents') + '/testMk';

  // 计算已打开的的所有文件信息
  const openFiles = openIds.map((openId) => {
    return files[openId];
  });

  // 计算正在编辑的文件信息
  const activeFile = files[activeId];

  // 计算当前左侧列表需要展示什么信息
  const fileList = searchFiles.length > 0 ? searchFiles : objToArr(files);

  // 点击左侧文件显示编辑页
  const openItem = (id) => {
    setActiveId(id);
    const currentFile = files[id];
    if (!currentFile.isLoaded) {
      readFile(currentFile.path).then((data) => {
        const newFile = { ...currentFile, body: data, isLoaded: true };
        setFiles({ ...files, [id]: newFile });
      });
    }
    if (!openIds.includes(id)) {
      setOpenIds([...openIds, id]);
    }
  };

  // 点击某个选项时切换当前状态
  const changeActive = (id) => {
    setActiveId(id);
  };

  // 点击关闭按钮
  const closeFile = (id) => {
    const retOpen = openIds.filter((openId) => openId !== id);
    setOpenIds(retOpen);

    // 当某一选项被关闭后,还需要给已打开的文件设置当前状态
    if (retOpen.length > 0 && activeId === id) {
      setActiveId(retOpen[retOpen.length - 1]);
    } else if (retOpen.length > 0 && activeId !== id) {
      setActiveId(activeId);
    } else {
      setActiveId('');
    }
  };

  // 当文件内容更新时
  const changeFile = (id, newValue) => {
    if (newValue !== files[id].body) {
      if (!unSavaIds.includes(id)) {
        setUnSavaIds([...unSavaIds, id]);
      }
      const newFile = { ...files[id], body: newValue };
      setFiles({ ...files, [id]: newFile });
    }
  };

  // 删除文件
  const deleteItem = (id) => {
    const file = files[id];
    if (file.title) {
      deleteFile(file.path).then(() => {
        delete files[id];
        setFiles(files);
        saveInfoToStore(files);
        // 如果当前删除的文件正在被打开, 那么删除的同时也关闭文件
        closeFile(id);
      });
    } else {
      delete files[id];
      setFiles(files);
      saveInfoToStore(files);
      // 如果当前删除的文件正在被打开, 那么删除的同时也关闭文件
      closeFile(id);
    }
  };

  // 根据关键字搜索文件
  const searchFile = (keyword) => {
    const newFiles = objToArr(files).filter((file) =>
      file.title.includes(keyword),
    );
    setSearchFiles(newFiles);
  };

  // 重命名文件名
  const saveData = (id, newTitle, isNew) => {
    const item = objToArr(files).find((file) => file.title === newTitle);
    if (item) {
      newTitle += '_copy';
    }
    const newPath = isNew
      ? path.join(savedPath, `${newTitle}.md`)
      : path.join(path.dirname(files[id].path), `${newTitle}.md`);
    const newFile = {
      ...files[id],
      title: newTitle,
      isNew: false,
      path: newPath,
    };
    const newFiles = { ...files, [id]: newFile };
    if (isNew) {
      // 创建
      writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles);
        saveInfoToStore(newFiles);
      });
    } else {
      // 更新
      const oldPath = files[id].path;
      renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles);
        saveInfoToStore(newFiles);
      });
    }
  };

  // 新建文件
  const createFile = () => {
    const newId = v4();
    const newFile = {
      id: newId,
      title: '',
      isNew: true,
      body: '### 初始化数据',
      createTime: new Date().getTime(),
    };
    let flag = objToArr(files).find((file) => file.isNew);
    if (!flag) {
      setFiles({ ...files, [newId]: newFile });
    }
  };

  // 保存当前正在编辑的文件
  const saveCurrentFile = () => {
    writeFile(activeFile.path, activeFile.body).then(() => {
      setUnSavaIds(unSavaIds.filter((id) => id !== activeId));
    });
  };

  const importFile = () => {
    remote.dialog
      .showOpenDialog({
        defaultPath: __dirname,
        buttonLabel: '请选择',
        title: '请选择md文件',
        properties: ['openFile', 'multiSelections'],
        filter: [
          { name: 'md文档', extensions: ['md'] },
          { name: '其他类型', extensions: ['js', 'json', 'html'] },
        ],
      })
      .then((ret) => {
        const paths = ret.filePaths;
        if (paths.length) {
          const validPaths = paths.filter((filePath) => {
            const existed = Object.values(files).find((file) => {
              return file.path === filePath;
            });
            return !existed;
          });

          const packageData = validPaths.map((filePath) => {
            return {
              id: v4(),
              title: path.basename(filePath, '.md'),
              path: filePath,
            };
          });

          const newFiles = { ...files, ...mapArr(packageData) };
          setFiles(newFiles);
          saveInfoToStore(newFiles);

          if (packageData.length) {
            remote.dialog.showMessageBox({
              type: 'info',
              title: '导入md文档',
              message: '导入成功!',
            });
          }
        } else {
          console.log('未选择文件');
        }
      });
  };

  // 主进程和渲染进程的事件通信
  useIpcRenderer({
    'execute-create-file': createFile,
    'execute-import-file': importFile,
    'execute-save-file': saveCurrentFile,
    // 'execute-search-file':
  });

  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <LeftDiv className="col-3 left-panel px-0">
          <SearchFile title="我的文档" onSearch={searchFile} />

          <FileList
            files={fileList}
            editFile={openItem}
            deleteFile={deleteItem}
            saveFile={saveData}
          />
          <div className="btn_list">
            <ButtonItem title={'新建'} icon={faPlus} btnClick={createFile} />
            <ButtonItem
              title={'导入'}
              icon={faFileImport}
              btnClick={importFile}
            />
          </div>
        </LeftDiv>
        <RightDiv className="col-9 right-panel px-0">
          {activeFile && (
            <>
              <Tablist
                files={openFiles}
                activeItem={activeId}
                unSavaItems={unSavaIds}
                clickItem={changeActive}
                closeItem={closeFile}
              />
              <SimpleMDE
                key={activeFile && activeFile.id}
                onChange={(value) => changeFile(activeFile.id, value)}
                value={activeFile.body}
                options={{
                  autofocus: true,
                  spellChecker: false,
                  minHeight: '475px',
                }}
              />
            </>
          )}
          {!activeFile && (
            <div className="init-page">新建或者导入具体的文档</div>
          )}
        </RightDiv>
      </div>
    </div>
  );
}

export default App;
