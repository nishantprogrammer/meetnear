import { useCallback, useMemo, useRef } from 'react';

// Memoize a callback function
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
) => {
  return useCallback(callback, deps);
};

// Memoize a value
export const useMemoizedValue = <T>(value: T, deps: any[]) => {
  return useMemo(() => value, deps);
};

// Debounce a function
export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

// Throttle a function
export const useThrottle = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (lastRun.current && now < lastRun.current + delay) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = now;
          callback(...args);
        }, delay);
      } else {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

// Memoize a component
export const memoizeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

// Memoize a selector function
export const createSelector = <T, R>(
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
) => {
  let lastState: T | undefined;
  let lastResult: R | undefined;

  return (state: T): R => {
    if (lastState === state) {
      return lastResult!;
    }

    const result = selector(state);
    if (lastResult !== undefined && equalityFn(lastResult, result)) {
      return lastResult;
    }

    lastState = state;
    lastResult = result;
    return result;
  };
};

// Batch state updates
export const batchUpdates = (updates: (() => void)[]) => {
  React.unstable_batchedUpdates(() => {
    updates.forEach(update => update());
  });
};

// Optimize list rendering
export const optimizeListRendering = <T>(
  items: T[],
  keyExtractor: (item: T) => string | number
) => {
  return items.map(item => ({
    ...item,
    key: keyExtractor(item),
  }));
};
