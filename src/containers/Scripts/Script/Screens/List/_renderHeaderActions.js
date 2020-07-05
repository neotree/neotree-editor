import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

import CopyScreens from '../Forms/CopyScreens';

function Actions({ selected }) {
  return (
    <>
      {selected.length > 0 && (
        <>
          <CopyScreens ids={selected}>
            <Button>Duplicate</Button>
          </CopyScreens>
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
