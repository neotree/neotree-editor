import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';

import DeleteConfigKeys from '../Forms/DeleteConfigKeys';
import DuplicateConfigKeys from '../Forms/DuplicateConfigKeys';

function Actions({ selected }) {
  return (
    <>
      {selected.length > 0 && (
        <>
          <DuplicateConfigKeys ids={selected}>
            <Button>Duplicate</Button>
          </DuplicateConfigKeys>

          <DeleteConfigKeys ids={selected}>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </DeleteConfigKeys>
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
