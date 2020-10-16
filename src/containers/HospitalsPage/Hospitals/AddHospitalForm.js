import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CountryInput from '@/components/CountryInput';
import * as api from '@/api/hospitals';

const defaultForm = { name: '', country: '', };

const AddHospitalForm = ({ updateState }) => {
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
          <Grid container spacing={2}>
            <Grid item xs={4} sm={4}>
              <CountryInput
                fullWidth
                label="Country"
                value={form.country}
                onChange={(e, country) => setForm({ country: country.code })}
              />
            </Grid>

            <Grid item xs={8} sm={8}>
              <TextField
                fullWidth
                label="Hospital Name"
                value={form.name}
                onChange={e => setForm({ name: e.target.value })}
              />
            </Grid>
          </Grid>
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
