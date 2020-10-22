import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MoreVert';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as api from '@/api/hospitals';
import HospitalForm, { defaultForm } from '../HospitalForm';
import Delete from './Delete';

const HospitalManagerForm = ({ updateState, hospital, authenticatedUser, }) => {
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
          <HospitalForm hospital={hospital} onChange={form => setForm(form)} />
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
            disabled={!(form.name && form.country)}
            onClick={() => {
              setLoading(true);
              api.updateHospital(form)
                .then(({ hospital }) => {
                  setLoading(false);
                  setOpen(false);
                  updateState(({ hospitals }) => ({
                    hospitals: hospitals.map(h => h.hospitalId === hospital.hospitalId ? hospital : h)
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

HospitalManagerForm.propTypes = {
  updateState: PropTypes.func.isRequired,
  hospital: PropTypes.object.isRequired,
  authenticatedUser: PropTypes.object,
};

export default HospitalManagerForm;
