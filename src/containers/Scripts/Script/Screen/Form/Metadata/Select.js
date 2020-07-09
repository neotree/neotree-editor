import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import wrapMetadataFormItem from './_wrapMetadataFormItem';

function Select({ form, setMetadata }) {
  React.useEffect(() => {
    setMetadata({
      dataType: (() => {
        switch (form.type) {
          case 'multi_select':
            return 'set<id>';
          default:
            return 'id';
        }
      }),
      confidential: false,
      key: null,
      label: null,
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
    </>
  );
}

Select.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default wrapMetadataFormItem(Select);
