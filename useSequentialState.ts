"strict";
import { React } from 'react';

/**
 * 
 * @param states 
 * @param unauthorizedSequence 
 * @returns 
 */

export function useSequentialState<T>(
  states: readonly T[],
  unauthorizedSequence: string[] = []
) {
  const [stateIndex, setState] = React.useState(0);
  const currentState = states[stateIndex];

  const updateState = (direction: 1 | -1) => {
    let succeeded = true;
    setState((prevStateIndex) => {
      let desiredStateIndex = prevStateIndex + direction;
      let greatestIndex = states.length - 1;

      if (desiredStateIndex < 0) desiredStateIndex = greatestIndex;
      else if (desiredStateIndex > greatestIndex) desiredStateIndex = 0;

      if (
        unauthorizedSequence.includes(
          states[prevStateIndex] + "_" + states[desiredStateIndex]
        )
      ) {
        succeeded = false;
        return prevStateIndex;
      }

      return desiredStateIndex;
    });

    if (!succeeded) {
      direction === -1 ? advance() : rewind();
    }
  };

  const tryChange = (desiredState: T, backward?: boolean) => {
    let succeeded = true;

    setState((prevStateIndex) => {


      if (states[prevStateIndex] === desiredState) return prevStateIndex;

      const desiredStateIndex = backward
        ? prevStateIndex - 1
        : prevStateIndex + 1;

      let possibleState: T = states[desiredStateIndex];

      if (
        possibleState !== desiredState ||
        unauthorizedSequence.includes(
          states[prevStateIndex] + "_" + desiredState
        )
      ) {
        succeeded = false;
        return prevStateIndex;
      }

      return desiredStateIndex;
    });

    if (!succeeded) {
      backward ? advance() : rewind();
    }

    return succeeded;
  };

  const advance = () => updateState(1);
  const rewind = () => updateState(-1);

  return {
    currentState,
    stateIndex,
    tryChange,
    advance,
    rewind,
  };
}
