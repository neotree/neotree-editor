import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as api from '@/api/users';
import UserForm, { defaultForm } from './UserForm';

const AddUserForm = ({ updateState, hospitals }) => {
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
        <AddIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <UserForm hospitals={hospitals} onChange={form => setForm(form)} />
        </DialogContent>

        <DialogActions>
          {!error ? null :
            <Typography>{error.msg || error.message || JSON.stringify(error)}</Typography>}
          <Button
            color="primary"
            variant="contained"
            disableElevation
            disabled={!form.email}
            onClick={() => {
              setLoading(true);
              api.addUser(form)
                .then(({ user }) => {
                  setLoading(false);
                  setOpen(false);
                  updateState(({ users }) => ({ users: [...users, user] }));
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

AddUserForm.propTypes = {
  updateState: PropTypes.func.isRequired,
  hospitals: PropTypes.array.isRequired,
};

export default AddUserForm;
