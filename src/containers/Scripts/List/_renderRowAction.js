import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

import DeleteScripts from '../Forms/DeleteScripts';
import CopyScripts from '../Forms/CopyScripts';

function Action({ row, }) {
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
          component={Link}
          to={`/scripts/${row.id}`}
          onClick={handleClose}
        >Edit</MenuItem>

        <MenuItem
          onClick={handleClose}
          ids={[row.id]}
          component={CopyScripts}
        >Copy</MenuItem>

        <MenuItem
          onClick={handleClose}
          ids={[row.id]}
          component={DeleteScripts}
        >
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

Action.propTypes = {
  row: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
};

export default (row, i) => <Action row={row} rowIndex={i} />;
