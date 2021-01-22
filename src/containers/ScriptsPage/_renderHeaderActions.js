import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { Link } from 'react-router-dom';
import Fab from '@material-ui/core/Fab';
import FabWrap from '@/components/FabWrap';

import DeleteScripts from './Forms/DeleteScripts';
import DuplicateScripts from './Forms/DuplicateScripts';

function Actions({ selected }) {
  return (
    <>
      {selected.length > 0 && (
        <>
          <DuplicateScripts scripts={selected.map(({ row }) => ({ scriptId: row.scriptId }))}>
            <Button>Duplicate</Button>
          </DuplicateScripts>

          <DeleteScripts scripts={selected.map(({ row }) => ({ scriptId: row.scriptId }))}>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </DeleteScripts>
        </>
      )}

      <Link to="/scripts/new">
        <Tooltip title="New script">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Link>

      <FabWrap>
        <Link to="/scripts/new">
          <Fab color="secondary">
            <AddIcon />
          </Fab>
        </Link>
      </FabWrap>
    </>
  );
}

Actions.propTypes = {
  selected: PropTypes.array.isRequired
};

export default params => <Actions {...params} />;
