import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { useAppContext } from '@/AppContext';
import { getUsers } from '@/api/users';
import { getHospitals } from '@/api/hospitals';
import AddUserForm from './AddUserForm';
import UserManagerForm from './UserManagerForm';

const Users = () => {
  const { state: { authenticatedUser } } = useAppContext();
  const [state, _setState] = React.useState({
    users: [],
    loading: false,
    form: {
      name: '',
      code: '',
    },
  });

  const setState = s => _setState(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const { users, hospitals } = state;

  React.useEffect(() => {
    (async () => {
      setState({ loading: true, });
      let users = [];
      let hospitals = [];

      try {
        const rslts = await getUsers();
        users = rslts.users;
      } catch (e) { setState({ getUsersErrors: e, loading: false, }); }
      try {
        const rslts = await getHospitals();
        hospitals = rslts.hospitals;
      } catch (e) { setState({ getHospitalsErrors: e, loading: false, }); }

      setState({ users: users || [], hospitals: hospitals || [], loading: false, });
    })();
  }, []);

  return (
    <>
      <Card>
        <CardHeader
          action={(
            <>
              <AddUserForm updateState={setState} hospitals={hospitals} />
            </>
          )}
          title="Users"
        />

        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, i) => {
                return (
                  <TableRow key={`user-${i}`}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell align="right">
                      <UserManagerForm
                        user={u}
                        hospitals={hospitals}
                        authenticatedUser={authenticatedUser}
                        updateState={setState}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default Users;
