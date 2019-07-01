import * as actions from '../actions';

const defaultState = JSON.parse(__$INITIAL_DATA__ || '{}'); // eslint-disable-line

export default (state = defaultState, action) => {
  const { type, payload, updater } = action;

  if (type === actions.RESET_APP_STATUS) return defaultState;

  if (type === actions.UPDATE_APP_STATUS) {
    let newState = { ...state, ...payload };
    if (updater) newState = Object.assign({}, newState, updater(newState));
    return newState;
  }

  return state;
};
