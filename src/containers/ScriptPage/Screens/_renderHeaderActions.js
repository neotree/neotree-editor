import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { Link, useParams } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';

import CopyScreens from './Forms/CopyScreens';

function Actions({ selected }) {
  const { scriptId } = useParams();

  return (
    <>
      {selected.length > 0 && (
        <>
          <CopyScreens 
            items={selected.map(({ row }) => ({ screenId: row.screenId, scriptId: row.scriptId, id: row.id, }))}
          >
            <Button>Copy</Button>
          </CopyScreens>
        </>
      )}

      <Link to={`/scripts/${scriptId}/screens/new`}>
        <Tooltip title="New screen">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Link>
    </>
  );
}

Actions.propTypes = {
  selected: PropTypes.array.isRequired
};

export default params => <Actions {...params} />;
