import { useState, useEffect, useCallback } from 'react';

export function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }, [key, value]);

  const setSticky = useCallback((val) => setValue(val), []);

  return [value, setSticky];
}
