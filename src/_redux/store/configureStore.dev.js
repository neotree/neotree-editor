/*eslint-disable import/no-extraneous-dependencies*/
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import createReducer from '../reducers';
import * as middlewares from '../middlewares';
import asyncReducers from './asyncReducers';

export default (initialState = {}) => {
  let store = createStore(
    createReducer(),
    initialState,
    applyMiddleware(
      thunk,
      middlewares.API_MIDDLEWARE,
      logger
    )
  );

  store = asyncReducers(store, createReducer);

  return store;
};