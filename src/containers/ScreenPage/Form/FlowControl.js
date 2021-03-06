import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Title from './Title';

function FlowControl({ setForm, form }) {
  React.useEffect(() => {
    setForm({
      skippable: null,
      condition: null,
      ...form,
    });
  }, []);

  return (
    <>
      <Title>FLOW CONTROL</Title>

      <div>
        <FormControlLabel
          control={(
            <Switch
              checked={!!form.skippable}
              onChange={() => setForm(f => ({ skippable: !f.skippable }))}
              name="skippable"
            />
          )}
          label="Allow user to skip this screen"
        />
      </div>
      <br />

      <div>
        <TextField
          fullWidth
          value={form.condition || ''}
          label="Conditional expression"
          onChange={e => setForm({ condition: e.target.value })}
        />
        <Typography
          variant="caption"
          color="textSecondary"
        >Example: <b>($key = true and $key2 = false) or $key3 = 'HD'</b></Typography>
      </div>
      <br />
    </>
  );
}

FlowControl.propTypes = {
  screen: PropTypes.object,
  script: PropTypes.object,
  form: PropTypes.object,
  setForm: PropTypes.func,
};

export default FlowControl;
