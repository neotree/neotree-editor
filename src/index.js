/* global document */
import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import App from './App';

const render = Component => {
  ReactDOM.render(
    <BrowserRouter>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Component />
      </MuiPickersUtilsProvider>
    </BrowserRouter>,
    document.getElementById('root')
  );
};

render(App);
