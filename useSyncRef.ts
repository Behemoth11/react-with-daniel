"strict";
import React from "react";

/**
 * Create a ref object that follows the change of value of a state object;
 *
 * @param state value to track using ref
 * @returns react ref with the value saved as the Note property
 */
export function useSyncRef<T>(state: T) {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = state;
  }, [state]);

  return ref as React.MutableRefObject<T>;
}
