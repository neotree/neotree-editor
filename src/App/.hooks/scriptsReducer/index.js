/* global localStorage */
import createSharedState from '../createSharedState';

const actions = (() => {
  const UPDATE = 'UPDATE';
  const updateState = partialState => ({ type: UPDATE, partialState });
  return { UPDATE, updateState };
})();

const initialState = {
  scripts: []
};

const reducer = (state = initialState, action) => {
  if (action.type === actions.UPDATE) {
    const newState = { ...state };
    return {
      ...state,
      ...(typeof action.partialState === 'function' ?
        action.partialState(newState) : action.partialState)
    };
  }
  return state;
};

export default createSharedState(reducer, initialState, actions);
