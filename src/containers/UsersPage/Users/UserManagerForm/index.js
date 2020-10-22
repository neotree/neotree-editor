import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MoreVert';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as api from '@/api/users';
import UserForm, { defaultForm } from '../UserForm';
import Delete from './Delete';

const UserManagerForm = ({ updateState, user, authenticatedUser, hospitals, }) => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [open, _setOpen] = useState(false);
  const setOpen = open => {
    if (loading) return;
    setForm(defaultForm);
    _setOpen(open);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <UserForm hospitals={hospitals} user={user} onChange={form => setForm(form)} />
        </DialogContent>

        <DialogActions>
          {!error ? null :
            <Typography>{error.msg || error.message || JSON.stringify(error)}</Typography>}

          <Delete
            user={user}
            disabled={authenticatedUser.email === user.email}
            updateState={updateState}
          />

          <Button
            color="primary"
            variant="contained"
            disableElevation
            disabled={!form.email}
            onClick={() => {
              setLoading(true);
              api.updateUser(form)
                .then(({ user }) => {
                  setLoading(false);
                  setOpen(false);
                  updateState(({ users }) => ({
                    users: users.map(u => u.userId === user.userId ? user : u)
                  }));
                })
                .catch(err => {
                  setLoading(false);
                  setError(err);
                });
            }}
          >Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

UserManagerForm.propTypes = {
  updateState: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  authenticatedUser: PropTypes.object,
  hospitals: PropTypes.array.isRequired,
};

export default UserManagerForm;
