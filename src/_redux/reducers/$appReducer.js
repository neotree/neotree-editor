/* global __$APP__*/
import * as actions from '../actions';

const defaultState = __$APP__;

export default (state = defaultState, action) => {
  const { type, payload, updater } = action;

  if (type === actions.$RESET_APP) return defaultState;

  if (type === actions.$UPDATE_APP) {
    let newState = { ...state, ...payload };
    if (updater) newState = Object.assign({}, newState, updater(newState));
    return newState;
  }

  return state;
};