import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import { setNavSection } from '@/contexts/app';

const List = LazyPage(() => import('./List'));

const ConfigKeys = () => {
  setNavSection('configKeys');

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
