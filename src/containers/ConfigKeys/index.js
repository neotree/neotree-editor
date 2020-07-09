import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';

const List = LazyPage(() => import('./List'));

const ConfigKeys = () => {
  return (
    <>
      <Switch>
        <Route
          exact
          path="/config-keys"
          component={List}
        />
        <Route
          path="*"
          render={() => <Redirect to="" />}
        />
      </Switch>
    </>
  );
};

export default ConfigKeys;
