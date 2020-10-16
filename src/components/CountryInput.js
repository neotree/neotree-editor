import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

function CountryInput({ onChange, onInputChange, ...props }) {
  return (
    <Autocomplete
      options={require('*/constants/countries.json')}
      getOptionLabel={o => o.name}
      onChange={onChange}
      onInputChange={onInputChange}
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
