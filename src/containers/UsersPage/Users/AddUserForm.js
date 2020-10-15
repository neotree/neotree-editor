import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import * as api from '@/api/users';

const AddUserForm = ({ updateState }) => {
  const defaultForm = { email: '' };
  const [form, _setForm] = useState(defaultForm);
  const setForm = v => _setForm({ ...form, ...v });

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
          <FormControl fullWidth>
            <TextField
              label="User email"
              value={form.email}
              onChange={e => setForm({ email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormControlLabel
              label="Admin user"
              control={(
                <Checkbox
                  value=""
                  checked={form.role === 1}
                  onChange={() => setForm({ role: form.role === 1 ? 0 : 1 })}
                />
              )}
            />
          </FormControl>
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
  updateState: PropTypes.func.isRequired
};

export default AddUserForm;
