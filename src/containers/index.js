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
  const { state: { authenticatedUser } } = useAppContext();

  return (
    <>
      <div>
        {!authenticatedUser ? (
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
              <Route render={() => <Redirect to="/" />} />
            </Switch>
          </>
        )}
      </div>
    </>
  );
};

export default Containers;
