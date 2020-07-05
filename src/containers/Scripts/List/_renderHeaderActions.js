import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';

import DeleteScripts from '../Forms/DeleteScripts';
import CopyScripts from '../Forms/CopyScripts';

function Actions({ selected }) {
  return (
    <>
      {selected.length > 0 && (
        <>
          <CopyScripts ids={selected}>
            <Button>Copy</Button>
          </CopyScripts>

          <DeleteScripts ids={selected}>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </DeleteScripts>
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
