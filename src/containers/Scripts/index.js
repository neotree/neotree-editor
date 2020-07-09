import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';

const List = LazyPage(() => import('./List'));
const Script = LazyPage(() => import('./Script'));

const Scripts = () => {
  return (
    <>
      <Switch>
        <Route
          exact
          path="/scripts"
          component={List}
        />
        <Route
          exact
          path="/scripts/:scriptId"
          component={Script}
        />
        <Route
          path="/scripts/:scriptId/:scriptSection"
          component={Script}
        />
        <Route
          path="*"
          render={() => <Redirect to="" />}
        />
      </Switch>
    </>
  );
};

export default Scripts;
