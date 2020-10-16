import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAppContext } from '@/contexts/app';
import AuthenticatedUserLayout from './AuthenticatedUserLayout';

const HomePage = LazyPage(() => import('./HomePage'));
const Scripts = LazyPage(() => import('./Scripts'));
const ConfigKeys = LazyPage(() => import('./ConfigKeys'));
const SettingsPage = LazyPage(() => import('./SettingsPage'));
const UsersPage = LazyPage(() => import('./UsersPage'));
const HospitalsPage = LazyPage(() => import('./HospitalsPage'));
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
            <AuthenticatedUserLayout>
              <Switch>
                <Route path="/scripts" component={Scripts} />
                <Route path="/config-keys" component={ConfigKeys} />
                <Route exact path="/users" component={UsersPage} />
                <Route exact path="/users/:section" component={UsersPage} />
                <Route exact path="/hospitals" component={HospitalsPage} />
                <Route exact path="/hospitals/:section" component={HospitalsPage} />
                <Route exact path="/settings" component={SettingsPage} />
                <Route exact path="/settings/:section" component={SettingsPage} />
                <Route exact path="/" component={HomePage} />
                <Route render={() => <Redirect to="/" />} />
              </Switch>
            </AuthenticatedUserLayout>
          </>
        )}
      </div>
    </>
  );
};

export default Containers;
