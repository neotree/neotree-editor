import * as actions from '../actions';

const defaultState = {};

export default (state = defaultState, action) => {
  const { type, payload, updater } = action;

  if (type === actions.RESET_API_DATA) return defaultState;

  if (type === actions.UPDATE_API_DATA) {
    let newState = { ...state, ...payload };
    if (updater) newState = Object.assign({}, newState, updater(newState));
    return newState;
  }

  return state;
};
