import { combineReducers } from 'redux';

import apiData from './apiDataReducer';
import appStatus from './appStatusReducer';
import loading from './loadingReducer';

export default function createReducer(asyncReducers) {
  return combineReducers({
    apiData,
    loading,
    appStatus,
    ...asyncReducers
  });
}
