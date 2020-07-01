import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAppContext } from '@/contexts/app';

const HomePage = LazyPage(() => import('./HomePage'));
const Scripts = LazyPage(() => import('./Scripts'));
const ConfigKeys = LazyPage(() => import('./ConfigKeys'));
const SettingsPage = LazyPage(() => import('./SettingsPage'));
const AuthenticationPage = LazyPage(() => import('./AuthenticationPage'));

const Containers = () => {
  const { authenticated } = useAppContext();

  return (
    <>
      <div>
        {!authenticated ? (
          <>
            <Switch>
              <Route exact path="/:authType" component={AuthenticationPage} />
              <Route path="*" render={() => <Redirect to="/sign-in" />} />
            </Switch>
          </>
        )
        :
        (
          <>
            <Switch>
              <Route path="/scripts" component={Scripts} />
              <Route path="/config-keys" component={ConfigKeys} />
              <Route path="/settings" component={SettingsPage} />
              <Route exact path="/" component={HomePage} />
            </Switch>
          </>
        )}
      </div>
    </>
  );
};

export default Containers;
