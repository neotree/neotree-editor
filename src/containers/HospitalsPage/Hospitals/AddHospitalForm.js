import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as api from '@/api/hospitals';
import HospitalForm, { defaultForm } from './HospitalForm';

const AddHospitalForm = ({ updateState }) => {
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
          <HospitalForm onChange={form => setForm(form)} />
        </DialogContent>

        <DialogActions>
          {!error ? null :
            <Typography>{error.msg || error.message || JSON.stringify(error)}</Typography>}
          <Button
            color="primary"
            variant="contained"
            disableElevation
            disabled={!(form.name && form.country)}
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

AddHospitalForm.propTypes = {
  updateState: PropTypes.func.isRequired
};

export default AddHospitalForm;
