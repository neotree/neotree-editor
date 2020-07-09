import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import { setNavSection } from '@/contexts/app';

const List = LazyPage(() => import('./List'));
const Script = LazyPage(() => import('./Script'));

const Scripts = () => {
  setNavSection('scripts');
  
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
