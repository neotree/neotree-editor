import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import wrapMetadataFormItem from './_wrapMetadataFormItem';

function YesNo({ form, setMetadata }) {
  React.useEffect(() => {
    setMetadata({
      dataType: 'boolean',
      confidential: false,
      key: null,
      label: null,
      negativeLabel: null,
      positiveLabel: null,
      ...form.metadata,
    });
  }, []);

  return (
    <>
      <div>
        <TextField
          fullWidth
          required
          error={!form.metadata.key}
          value={form.metadata.key || ''}
          label="Input key"
          onChange={e => setMetadata({ key: e.target.value })}
        />
      </div>
      <br />

      <div>
        <TextField
          fullWidth
          required
          error={!form.metadata.label}
          value={form.metadata.label || ''}
          label="Input label"
          onChange={e => setMetadata({ label: e.target.value })}
        />
      </div>
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

      <Grid container spacing={1}>
        <Grid xs={6} sm={6} item>
          <TextField
            fullWidth
            required
            error={!form.metadata.negativeLabel}
            value={form.metadata.negativeLabel || ''}
            label="Negative label"
            onChange={e => setMetadata({ negativeLabel: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={6} item>
          <TextField
            fullWidth
            required
            error={!form.metadata.positiveLabel}
            value={form.metadata.positiveLabel || ''}
            label="Positive label"
            onChange={e => setMetadata({ positiveLabel: e.target.value })}
          />
        </Grid>
      </Grid>
      <br />
    </>
  );
}

YesNo.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default wrapMetadataFormItem(YesNo);
