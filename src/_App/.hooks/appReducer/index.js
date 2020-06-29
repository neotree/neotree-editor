/* global __$APP__*/
import createSharedState from '../createSharedState';

const actions = (() => {
  const UPDATE = 'UPDATE';
  const updateState = (partialState = {}) => ({
    type: UPDATE, partialState
  });

  return {
    UPDATE,
    updateState
  };
})();

const initialState = (() => {
  let _initialState = {};

  try {
    _initialState = __$APP__;
  } catch (e) {
    _initialState = { fatal_error: e };
  }
  return _initialState;
})();

const reducer = (state = initialState, action) => {
  if (action.type === actions.UPDATE) {
    let newState = { ...state };
    newState = {
      ...state,
      ...(typeof action.partialState === 'function' ?
        action.partialState(newState) : action.partialState)
    };

    return newState;
  }

  return state;
};

export default createSharedState(reducer, initialState, actions);
