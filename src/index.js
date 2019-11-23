import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import configureStore from 'store';  
import App from './App';

import './App/styles/index.scss';
import './App/styles/index.css';

const store = configureStore();

const render = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <Component store={store} />
      </Router>
    </Provider>,
    document.getElementById('root') 
  );
};

render(App);
