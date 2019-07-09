import { combineReducers } from 'redux';

import apiData from './apiDataReducer';
import $APP from './$appReducer';
import loading from './loadingReducer';

export default function createReducer(asyncReducers) {
  return combineReducers({
    apiData,
    loading,
    $APP,
    ...asyncReducers
  });
}
