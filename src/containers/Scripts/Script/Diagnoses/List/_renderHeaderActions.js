import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

import CopyDiagnoses from '../Forms/CopyDiagnoses';

function Actions({ selected }) {
  return (
    <>
      {selected.length > 0 && (
        <>
          <CopyDiagnoses ids={selected}>
            <Button>Duplicate</Button>
          </CopyDiagnoses>
        </>
      )}

      <IconButton>
        <AddIcon />
      </IconButton>
    </>
  );
}

Actions.propTypes = {
  selected: PropTypes.array.isRequired
};

export default params => <Actions {...params} />;
