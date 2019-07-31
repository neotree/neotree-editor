/*
  Subscribe to a shared state and update components when the shared state is updated.
  https://medium.com/crowdbotics/how-to-use-usereducer-in-react-hooks-for-performance-optimization-ecafca9e7bf5
*/
import { useReducer, useEffect } from 'react';

const useForceUpdate = () => useReducer(state => !state, false)[1];

export default (reducer, initialState) => {
  const subscribers = [];
  let state = initialState;

  const dispatch = action => {
    state = reducer(state, action);
    subscribers.forEach(cb => cb());
  };

  const useSharedState = () => {
    const forceUpdate = useForceUpdate();
    useEffect(() => {
      const cb = () => forceUpdate();
      subscribers.push(cb);
      cb();
      const cleanup = () => {
        const index = subscribers.indexOf(cb);
        subscribers.splice(index, 1);
      };

      return cleanup;
    }, []);
    return [state, dispatch];
  };

  return useSharedState;
};
