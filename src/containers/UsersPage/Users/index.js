import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { useAppContext } from '@/contexts/app';
import { provideUsersContext, useUsersContext } from '@/contexts/users';
import Form from './Form';
import Delete from './Delete';

const Users = () => {
  const { state: { authenticatedUser } } = useAppContext();
  const { state: { users }, setState } = useUsersContext();

  return (
    <>
      <Card>
        <CardHeader
          action={(
            <>
              <Form updateState={setState} />
            </>
          )}
          title="Users"
        />

        <CardContent>
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
        </CardContent>
      </Card>
    </>
  );
};

export default provideUsersContext(Users);
