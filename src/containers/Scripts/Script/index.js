import React from 'react';
import { provideScriptContext } from '@/contexts/script';
import { Switch, Route, Redirect } from 'react-router-dom';
import LazyPage from '@/components/LazyPage';

const ScriptEditor = LazyPage(() => import('./ScriptEditor'));
const Screen = LazyPage(() => import('./Screen'));
const Diagnosis = LazyPage(() => import('./Diagnosis'));

function Script() {
  return (
    <>
      <Switch>
        <Route
          exact
          path="/scripts/:scriptId"
          component={ScriptEditor}
        />

        <Route
          exact
          path="/scripts/:scriptId/:scriptSection"
          component={ScriptEditor}
        />

        <Route
          exact
          path="/scripts/:scriptId/screens/:screenId"
          component={Screen}
        />

        <Route
          exact
          path="/scripts/:scriptId/diagnoses/:diagnosisId"
          component={Diagnosis}
        />

        <Route
          path="*"
          render={() => <Redirect to="" />}
        />
      </Switch>
    </>
  );
}

export default provideScriptContext(Script);
