import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Grid from '@material-ui/core/Grid';
import CountryInput, { countries } from '@/components/CountryInput';
import Autocomplete from '@material-ui/lab/Autocomplete';

export const defaultForm = { email: '', countries: [], hospitals: [], };

const UserForm = ({ onChange, user, hospitals }) => {
  const [form, _setForm] = useState(defaultForm);
  const setForm = v => _setForm(prev => ({
    ...prev,
    ...(typeof v === 'function' ? v(prev) : v)
  }));

  React.useEffect(() => { onChange(form); }, [form]);

  React.useEffect(() => { setForm({ ...user }); }, [user]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <TextField
            fullWidth
            autoFocus
            label="User email"
            value={form.email}
            required
            error={!form.email}
            onChange={e => setForm({ email: e.target.value })}
          />
        </Grid>

        <Grid xs={12}>
          <br />
          <Typography variant="button">Countries</Typography>
          <Divider />
          <br />
        </Grid>

        <Grid item xs={12} sm={12}>
          <List>
            {form.countries.map(c => {
              const country = countries.filter(country => country.code === c)[0];
              if (!country) return null;
              return (
                <ListItem key={c}>
                  <ListItemText primary={country.name} />
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>

          <CountryInput
            fullWidth
            label="Add Country"
            onChange={(e, { code: country }) => {
              setForm(({ countries }) => ({
                countries: [...countries, ...(countries.includes(country) ? [] : [country])]
              }));
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <br />
          <Typography variant="button">Hospitals</Typography>
          <Divider />
          <br />
        </Grid>

        <Grid item xs={12} sm={12}>
          <List>
            {form.hospitals.map(h => {
              const hospital = hospitals.filter(hospital => hospital.hospitalId === h)[0];
              if (!hospital) return null;
              return (
                <ListItem key={h}>
                  <ListItemText primary={hospital.name} />
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>

          <Autocomplete
            fullWidth
            options={hospitals}
            value={{}}
            getOptionLabel={o => o.name || ''}
            onChange={(e, { hospitalId: hospital }) => {
              setForm(({ hospitals }) => ({
                hospitals: [...hospitals, ...(hospitals.includes(hospital) ? [] : [hospital])]
              }));
            }}
            renderInput={params => (<TextField {...params} label="Add Hospital" />)}
          />
        </Grid>
      </Grid>
    </>
  );
};

UserForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  user: PropTypes.object,
  hospitals: PropTypes.array.isRequired,
};

export default UserForm;
