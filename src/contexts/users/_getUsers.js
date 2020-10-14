import * as api from '@/api/users';

export default function getUsers() {
  this.setState({ loadingUsers: true });

  const done = (e, rslts = {}) => {
    this.setState({
      loadUsersError: e,
      ...rslts,
      usersInitialised: true,
      loadingUsers: false, 
    });
  };

  api.getUsers()
    .then(rslts => done(rslts.errors, rslts))
    .catch(done);
}
