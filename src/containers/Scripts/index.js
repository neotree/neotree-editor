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
          exact
          path="/scripts/:scriptId/screen/:screenId"
          component={Script}
        />
        <Route
          exact
          path="/scripts/:scriptId/diagnosis/:diagnosisId"
          component={Script}
        />
        <Route
          exact
          path="*"
          render={() => <Redirect to="" />}
        />
      </Switch>
    </>
  );
};

export default Scripts;
