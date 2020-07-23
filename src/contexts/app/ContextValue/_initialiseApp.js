import * as api from '@/api/app';

export default function initialiseApp() {
  this.setState({ initialisingApp: true });

  const done = (initialiseAppError, app = {}) => {
    this.setState({
      initialiseAppError,
      ...app,
      appInitialised: true,
      initialisingApp: false,
    });
  };

  api.initialiseApp()
    .then(app => done(app.errors, app))
    .catch(done);
}
