import { useState, useEffect } from 'react';

const useKeyHandler = (code) => {
  const [keyPressed, setKeyPressed] = useState(false);

  // 按下
  const keyDownHandler = ({ keyCode }) => {
    if (keyCode === code) {
      setKeyPressed(true);
    }
  };

  // 抬起
  const keyUpHandler = ({ keyCode }) => {
    if (keyCode === code) {
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  return keyPressed;
};

export default useKeyHandler