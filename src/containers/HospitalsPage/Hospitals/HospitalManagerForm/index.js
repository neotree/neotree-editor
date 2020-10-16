import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MoreVert';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import * as api from '@/api/hospitals';
import Delete from './Delete';

const defaultForm = { country: '', name: '' };

const HospitalManagerForm = ({ updateState, hospital, authenticatedUser, }) => {
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
        <MenuIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4} sm={4}>
              <TextField
                label="Country"
                value={form.country}
                onChange={e => setForm({ country: e.target.value })}
              />
            </Grid>

            <Grid item xs={8} sm={8}>
              <TextField
                label="Name"
                value={form.name}
                onChange={e => setForm({ name: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          {!error ? null :
            <Typography>{error.msg || error.message || JSON.stringify(error)}</Typography>}

          <Delete
            hospital={hospital}
            disabled={authenticatedUser.email === hospital.email}
            updateState={updateState}
          />

          <Button
            color="primary"
            variant="contained"
            disableElevation
            disabled
            onClick={() => {
              setLoading(true);
              api.addHospital(form)
                .then(({ hospital }) => {
                  setLoading(false);
                  setOpen(false);
                  updateState(({ hospitals }) => ({ hospitals: [...hospitals, hospital] }));
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

HospitalManagerForm.propTypes = {
  updateState: PropTypes.func.isRequired,
  hospital: PropTypes.object.isRequired,
  authenticatedUser: PropTypes.object,
};

export default HospitalManagerForm;
