import React from 'react';
import { provideScriptContext } from '@/contexts/script';
import { Switch, Route, Redirect } from 'react-router-dom';
import LazyPage from '@/components/LazyPage';

const ScriptEditor = LazyPage(() => import('./ScriptEditor'));
const Screen = LazyPage(() => import('./Screen'));

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
          path="/scripts/:scriptId/:scriptSection/:scriptItemId"
          component={Screen}
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
