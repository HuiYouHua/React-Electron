import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faEdit,
  faTrashAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import { getParentNode } from '../utils/helper';
import useKeyHandler from '../hooks/useKeyHandler';
import useContextMenu from '../hooks/useContextMenu';

let GroupUl = styled.ul.attrs({
  className: 'list-group list-group-flush menu-box',
})`
  li {
    color: #fff;
    background: none;
  }
`;

const FileList = ({ files, editFile, saveFile, deleteFile }) => {
  const [editItem, setEditItem] = useState(false);
  const [value, setValue] = useState('');
  const enterPressed = useKeyHandler(13);
  const escPressed = useKeyHandler(27);
  const oInput = useRef(null);

  const closeFn = () => {
    setEditItem(false);
    setValue('');
  };

  const contextMenuTmp = [
    {
      label: '重命名',
      click() {
        let retNode = getParentNode(currentEle.current, 'menu-item');
        setEditItem(retNode.dataset.id);
      },
    },
    {
      label: '删除',
      click() {
        let retNode = getParentNode(currentEle.current, 'menu-item');
        deleteFile(retNode.dataset.id);
      },
    },
  ];
  const currentEle = useContextMenu(contextMenuTmp, '.menu-box');

  useEffect(() => {
    if (enterPressed && editItem && value.trim() !== '') {
      // enter
      const file = files.find((file) => file.id === editItem);
      saveFile(editItem, value, file.isNew);
      closeFn();
    }

    if (escPressed && editItem) {
      // esc
      closeFn();
    }
  });

  useEffect(() => {
    if (editItem) {
      oInput.current?.focus();
    }
  }, [editItem]);

  useEffect(() => {
    const newFile = files.find((file) => file.isNew);
    if (newFile) {
      setEditItem(newFile.id);
      setValue(newFile.title);
    }
  }, [files]);

  useEffect(() => {
    const newFile = files.find((file) => file.isNew);
    if (newFile && editItem !== newFile.id) {
      // 新建了一个文件, 但是又去点击了另外一个非新建的文件
      deleteFile(newFile.id);
    }
  }, [editItem]);

  return (
    <GroupUl>
      {files.map((file) => {
        return (
          <li
            className="list-group-item d-flex align-items-center menu-item"
            key={file.id}
            data-id={file.id}
            data-title={file.title}
          >
            {file.id !== editItem && !file.isNew && (
              <>
                <span className="mr-2">
                  <FontAwesomeIcon icon={faFileAlt} />
                </span>
                <span
                  className="col-8"
                  onClick={() => {
                    editFile(file.id);
                    closeFn();
                  }}
                >
                  {file.title}
                </span>
              </>
            )}
            {(file.id === editItem || file.isNew) && (
              <>
                <input
                  className="col-9"
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  ref={oInput}
                />
              </>
            )}
          </li>
        );
      })}
    </GroupUl>
  );
};

export default FileList;
