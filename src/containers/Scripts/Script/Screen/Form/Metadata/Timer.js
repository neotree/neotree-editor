import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import wrapMetadataFormItem from './_wrapMetadataFormItem';

function Timer({ form, setMetadata }) {
  React.useEffect(() => { 
    setMetadata({
      dataType: 'number',
      confidential: false,
      key: null,
      label: null,
      timerValue: null,
      multiplier: null,
      minValue: null,
      maxValue: null,
      ...form.metadata,
    });
  }, []);

  return (
    <>
      <Grid container spacing={1}>
        <Grid xs={6} sm={6} item>
          <TextField
            fullWidth
            value={form.metadata.key || ''}
            label="Input key"
            onChange={e => setMetadata({ key: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={6} item>
          <TextField
            fullWidth
            value={form.metadata.label || ''}
            label="Input label"
            onChange={e => setMetadata({ label: e.target.value })}
          />
        </Grid>

        <Grid item sm={12}><br /></Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.metadata.timerValue || ''}
            label="Timer value (seconds)"
            onChange={e => setMetadata({ timerValue: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.metadata.multiplier || ''}
            label="Multiplier"
            onChange={e => setMetadata({ multiplier: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.metadata.minValue || ''}
            label="Input value min."
            onChange={e => setMetadata({ minValue: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.metadata.maxValue || ''}
            label="Input value max."
            onChange={e => setMetadata({ maxValue: e.target.value })}
          />
        </Grid>
      </Grid>

      <br />

      <div>
        <FormControlLabel
          control={(
            <Switch
              checked={!!form.metadata.confidential}
              onChange={() => setMetadata({ confidential: !form.metadata.confidential })}
              name="confidential"
            />
          )}
          label="Confidential"
        />
      </div>

      <br />
    </>
  );
}

Timer.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default wrapMetadataFormItem(Timer);
