import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import CountryInput from '@/components/CountryInput';

export const defaultForm = { name: '', country: '', };

const HospitalForm = ({ onChange, hospital }) => {
  const [form, _setForm] = useState(defaultForm);
  const setForm = v => _setForm(prev => ({
    ...prev,
    ...(typeof v === 'function' ? v(prev) : v)
  }));

  React.useEffect(() => { onChange(form); }, [form]);

  React.useEffect(() => { setForm({ ...hospital }); }, [hospital]);

  return (
    <>
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
    </>
  );
};

HospitalForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  hospital: PropTypes.object,
};

export default HospitalForm;
