import React, { useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import usersReducer from 'AppHooks/usersReducer';
import appReducer from 'AppHooks/appReducer';
import Api from 'AppUtils/Api';
import Form from './Form';
import Delete from './Delete';

const Users = () => {
  const [{ authenticatedUser }] = appReducer();

  const [{ users }, dispatchUsersActions, usersActions] = usersReducer();
  const updateState = s => dispatchUsersActions(usersActions.updateState(s));

  useEffect(() => {
    Api.get('/get-users')
      .then(({ payload: { users } }) => updateState({ users }))
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      <Typography
        variant="h5"
        className="ui__flex ui__alignItems_center"
      >
        <span>Users</span>
        <Form updateState={updateState} />
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u, i) => {
            return (
              <TableRow key={`user-${i}`}>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Delete
                    user={u}
                    disabled={authenticatedUser.email === u.email}
                    updateState={updateState}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default Users;
