import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import wrapMetadataFormItem from './_wrapMetadataFormItem';

function KeyLabel({ form, setMetadata }) {
  React.useEffect(() => {
    setMetadata({
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
      <br /><br />

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
      <br /><br />
    </>
  );
}

KeyLabel.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default wrapMetadataFormItem(KeyLabel);
