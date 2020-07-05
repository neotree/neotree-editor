import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';

const List = LazyPage(() => import('./List'));

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
          component={List}
        />
        <Route
          exact
          path="/scripts/:scriptId/screen/:screenId"
          component={List}
        />
        <Route
          exact
          path="/scripts/:scriptId/diagnosis/:diagnosisId"
          component={List}
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
