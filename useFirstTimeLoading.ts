import { React } from 'react';


  /**
   * Hook that indicate it's the first time the component is loading
   *
   * @returns a boolean indicating if the it's the first time a component is loading
   */
   export const useFirstTimeLoading = () => {
    const load = React.useRef(true);
    React.useEffect(() => {
      load.current = false;
    }, []);
  
    return load.current as boolean;
  };
  