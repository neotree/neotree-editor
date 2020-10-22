import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import countries from '*/constants/countries.json';

export { countries };

function CountryInput({ onChange, onInputChange, value, ...props }) {
  return (
    <Autocomplete
      options={countries}
      getOptionLabel={o => o.name || ''}
      onChange={onChange}
      onInputChange={onInputChange}
      value={{ ...countries.filter(c => c.code === value)[0] }}
      renderInput={params => (
        <TextField
          {...params}
          {...props}
        />
      )}
    />
  );
}

CountryInput.propTypes = {
  onChange: PropTypes.func,
  onInputChange: PropTypes.func,
};

export default CountryInput;
