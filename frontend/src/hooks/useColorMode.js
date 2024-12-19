// frontend/src/hooks/useColorMode.js

import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const useColorMode = () => {
  const [colorMode, setColorMode] = useLocalStorage('color-theme', 'light');

  useEffect(() => {
    const className = 'dark';
    const root = window.document.documentElement;

    if (colorMode === 'dark') {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;