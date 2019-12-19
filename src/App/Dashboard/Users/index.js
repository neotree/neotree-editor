import React, { useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import usersReducer from 'AppHooks/usersReducer';

const Users = () => {
  const [{ users }] = usersReducer();

  useEffect(() => {

  }, []);

  return (
    <>
      <Typography
        variant="h5"
        className="ui__flex ui__alignItems_center"
      >
        <span>Users</span>
        <IconButton size="small">
          <AddIcon />
        </IconButton>
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox
                value={''}
                onChange={() => {}}
              />
            </TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u, i) => {
            return (
              <TableRow key={`user-${i}`}>
                <TableCell>
                  <Checkbox
                    value={''}
                    onChange={() => {}}
                  />
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <IconButton size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
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
