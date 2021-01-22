import React from 'react';
import LazyPage from '@/components/LazyPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAppContext } from '@/contexts/app';
import AuthenticatedUserLayout from './AuthenticatedUserLayout';

const HomePage = LazyPage(() => import('./HomePage'));
const ScriptsPage = LazyPage(() => import('./ScriptsPage'));
const ScriptPage = LazyPage(() => import('./ScriptPage'));
const ScreenPage = LazyPage(() => import('./ScreenPage'));
const DiagnosisPage = LazyPage(() => import('./DiagnosisPage'));
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
                <Route
                  exact
                  path="/config-keys"
                  component={ConfigKeys}
                />

                <Route
                  exact
                  path="/scripts/:scriptId/screens/:screenId"
                  component={ScreenPage}
                />

                <Route
                  exact
                  path="/scripts/:scriptId/diagnoses/:diagnosisId"
                  component={DiagnosisPage}
                />

                <Route
                  exact
                  path="/scripts/:scriptId/:scriptSection"
                  component={ScriptPage}
                />

                <Route
                  exact
                  path="/scripts/:scriptId"
                  component={ScriptPage}
                />

                <Route
                  exact
                  path="/scripts"
                  component={ScriptsPage}
                />

                <Route
                  exact
                  path="/users"
                  component={UsersPage}
                />

                <Route
                  exact
                  path="/users/:section"
                  component={UsersPage}
                />

                <Route
                  exact
                  path="/hospitals"
                  component={HospitalsPage}
                />

                <Route
                  exact
                  path="/hospitals/:section"
                  component={HospitalsPage}
                />

                <Route
                  exact
                  path="/settings"
                  component={SettingsPage}
                />

                <Route
                  exact
                  path="/settings/:section"
                  component={SettingsPage}
                />

                <Route
                  exact
                  path="/"
                  component={HomePage}
                />

                <Route
                  render={() => <Redirect to="/" />}
                />
              </Switch>
            </AuthenticatedUserLayout>
          </>
        )}
      </div>
    </>
  );
};

export default Containers;
