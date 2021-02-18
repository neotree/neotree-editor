import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { useAppContext } from '@/AppContext';

import DeleteConfigKeys from './Forms/DeleteConfigKeys';
import DuplicateConfigKeys from './Forms/DuplicateConfigKeys';
import ConfigKeyForm from './Forms/ConfigKeyForm';

function Action({ row, }) {
  const { state: { viewMode } } = useAppContext();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={handleClose}
          configKey={row}
          component={ConfigKeyForm}
        >{viewMode === 'view' ? 'View' : 'Edit'}</MenuItem>

        {viewMode === 'view' ? null : (
          <MenuItem
            onClick={handleClose}
            configKeys={[{ id: row.id }]}
            component={DuplicateConfigKeys}
          >Duplicate</MenuItem>
        )}

        {viewMode === 'view' ? null : (
          <MenuItem
            onClick={handleClose}
            configKeys={[{ id: row.id }]}
            component={DeleteConfigKeys}
          >
            <Typography color="error">Delete</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

Action.propTypes = {
  row: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
};

export default (row, i) => <Action row={row} rowIndex={i} />;
