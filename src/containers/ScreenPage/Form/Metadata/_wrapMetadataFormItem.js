import React from 'react';
import PropTypes from 'prop-types';

export default function wrapMetadataFormItem(Component) {
  function MetadataFormItem(props) {
    const { setForm, } = props;

    const setMetadata = v => setForm(f => ({
      metadata: {
        ...f.metadata,
        ...v
      }
    }));

    return (
      <>
        <Component {...props} setMetadata={setMetadata} />
      </>
    );
  };

  MetadataFormItem.propTypes = {
    screen: PropTypes.object,
    script: PropTypes.object,
    form: PropTypes.object,
    setForm: PropTypes.func,
  };

  return MetadataFormItem;
}
