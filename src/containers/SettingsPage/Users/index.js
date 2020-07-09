import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { useAppContext } from '@/contexts/app';
import { provideUsersContext, useUsersContext } from '@/contexts/users';
import Form from './Form';
import Delete from './Delete';

const Users = () => {
  const { state: { authenticatedUser } } = useAppContext();
  const { state: { users }, setState } = useUsersContext();

  return (
    <>
      <Typography
        variant="h6"
        className="ui__flex ui__alignItems_center"
      >
        <span>Users</span>
        <Form updateState={setState} />
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
                    updateState={setState}
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

export default provideUsersContext(Users);
