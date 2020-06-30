import * as api from '@/api/app';

export default ({ state, setState }) => function initialiseApp() {
  setState({ initialisingApp: true });

  const done = (initialiseAppError, app = {}) => {
    setState({ initialiseAppError, ...app });
  };

  api.initialiseApp()
    .then(app => done(null, app))
    .catch(done);
};
