export default (store, createReducer) => {
  store.asyncReducers = {};

  store.insertAsyncReducer = (store, reducer, value) => {
    store.asyncReducers[reducer] = value;
    store.replaceReducer(createReducer(store.asyncReducers));
  };

  store.removeAsyncReducer = (store, reducer) => {
    const asyncReducers = Object.keys(store.asyncReducers)
      .reduce((acc, key) => {
        if (key !== reducer) acc[key] = store.asyncReducers[key];
        return acc;
      }, {});
    store.asyncReducers = asyncReducers;
    store.replaceReducer(createReducer(store.asyncReducers));
  };

  return store;
};
