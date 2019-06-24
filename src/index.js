import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import configureStore from 'store';  // eslint-disable-line
import App from './App';

const store = configureStore();

const render = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <Component store={store} />
      </Router>
    </Provider>,
    document.getElementById('root') // eslint-disable-line
  );
};

render(App);
