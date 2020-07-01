import * as api from '@/api/app';

export default ({ setState }) => function initialiseApp() {
  setState({ initialisingApp: true });

  const done = (initialiseAppError, app = {}) => {
    setState({ initialiseAppError, ...app, appInitialised: true });
  };

  api.initialiseApp()
    .then(app => done(app.errors, app))
    .catch(done);
};
