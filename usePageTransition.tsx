"strict";
import React from "react";
import { useFirstTimeLoading } from "./useFirstTimeLoading";


type lifeCycleCallback = (ctx: { pageId: string; nextPageId: string }) => void;

interface lifeCycle {
  beforeSwap: lifeCycleCallback[];
  afterSwap: lifeCycleCallback[];
  onEnter: lifeCycleCallback[];
  onExit: lifeCycleCallback[];
}

// type waitList = Set<string>
export const usePageTransition = (
  children: React.ReactNode & { key: string }
) => {
  const firstTimeLoading = useFirstTimeLoading();

  const [activePage, setActivePage] = React.useState(children);

  // waitList is a set of all id with whose waiFor( id ) was called.
  const waitListRef = React.useRef(new Set() as Set<string>);

  const lifeCyclesRef = React.useRef<lifeCycle>({
    beforeSwap: [],
    afterSwap: [],
    onEnter: [],
    onExit: [],
  });

  const [pageState, setPageState] = React.useState<"enter" | "exit">("enter");

  const tryChange = (newPageState: "enter"| "exit") =>
    setPageState((prevState) => (prevState === newPageState? "exit" : "enter"));

  // const pageState = useSequentialState(["exit", "enter"] as const);

  const executeLifeCycleCallBack = (lifeCycle: keyof lifeCycle) => {
    for (const callback of lifeCyclesRef.current[lifeCycle]) {
      callback({ pageId: activePage.key, nextPageId: children.key });
    }
  };

  const syncActivePage = () => {
    if (children.key === activePage.key) return;

    executeLifeCycleCallBack("beforeSwap");

    setActivePage(children);

    executeLifeCycleCallBack("afterSwap");

    waitListRef.current = new Set();
  };

  const waitFor = (id: string) => {
    waitListRef.current.add(id);
  };

  const removeHold = (id: string) => {
    waitListRef.current.delete(id);
    if (waitListRef.current.size === 0) {
      tryChange("enter");
      executeLifeCycleCallBack("onEnter");
    }
    // render();
  };

  const pageId = React.useMemo(() => {
    return activePage.key;
  }, [activePage]);

  React.useEffect(() => {
    if (firstTimeLoading) return;
    // there is a page change but the component is the same as the active one the page assumes a enter state;
    // If on page A. One could route to page B. The children would change but not finish updating. Then if he
    // returns to page A, the page would change but the corresponding state would be a from exit to enter.
    else if (children.key === activePage.key) {
      tryChange("enter");
      executeLifeCycleCallBack("onEnter");
    } else {
      tryChange("exit");
      executeLifeCycleCallBack("onExit");
    }
  }, [children]);

  React.useEffect(() => {
    if (waitListRef.current.size === 0) syncActivePage();
  }, [pageState, waitListRef.current.size]);

  const page = {
    waitFor,
    tryChange,
    removeHold,
    id: pageId,
    currentState: pageState,
    addEventListener: (event: keyof lifeCycle, callback: lifeCycleCallback) => {
      const validKeys = Object.keys(lifeCyclesRef.current);
      if (!validKeys.includes(event)) return;

      lifeCyclesRef.current[event].push(callback);
    },
  };

  return {
    activePage,
    pageState: page,
    Provider: RoutingStateProvider,
  };
};


export default usePageTransition;

interface RoutingStateContext {
  id: string;
  waitFor: (id: string) => void;
  removeHold: (id: string) => void;
  currentState: "exit" | "enter";
  tryChange: (desiredState: "exit" | "enter") => void;
  addEventListener: (
    event: keyof lifeCycle,
    callback: lifeCycleCallback
  ) => void;
}

const RoutingStateContext = React.createContext<RoutingStateContext>({
  id: "",
  currentState: "enter",
  waitFor: () => undefined,
  removeHold: () => undefined,
  addEventListener: () => undefined,
  tryChange: () => console.log("state Not available"),
});

export const RoutingStateProvider: React.FC<RoutingStateContext> = ({
  children,
  ...contextValues
}) => {
  return (
    <RoutingStateContext.Provider value={contextValues}>
      {children}
    </RoutingStateContext.Provider>
  );
};

export const useRoutingStateContext = () => {
  return React.useContext(RoutingStateContext);
};
