import { useEffect, useRef } from 'react';
const { remote } = window.require('electron');
const { Menu } = remote;

function useContextMenu(contextMenuTmp, areaClass) {
  const currentEle = useRef(null);

  useEffect(() => {
    const areaEle = document.querySelector(areaClass);

    // 只在特定区域显示Menu
    const menu = Menu.buildFromTemplate(contextMenuTmp);
    const contextMenuHandle = (ev) => {
      if (areaEle.contains(ev.target)) {
        currentEle.current = ev.target;
        menu.popup({ window: remote.getCurrentWindow });
      }
    };
    window.addEventListener('contextmenu', contextMenuHandle);

    return () => {
      window.removeEventListener('contextmenu', contextMenuHandle);
    };
  });
  return currentEle;
}

export default useContextMenu;
