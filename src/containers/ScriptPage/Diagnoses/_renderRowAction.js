import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/AppContext';

import DeleteDiagnoses from './Forms/DeleteDiagnoses';
import CopyDiagnoses from './Forms/CopyDiagnoses';
// import DuplicateScreens from './Forms/DuplicateDiagnoses';

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
          component={Link}
          to={`/scripts/${row.scriptId}/diagnoses/${row.id}`}
          onClick={handleClose}
        >{viewMode === 'view' ? 'View' : 'Edit'}</MenuItem>

        {viewMode === 'view' ? null : (
          <MenuItem
            onClick={handleClose}
            items={[{ diagnosisId: row.diagnosisId, scriptId: row.scriptId, id: row.id, }]}
            component={CopyDiagnoses}
          >Copy</MenuItem>
        )}

        {viewMode === 'view' ? null : (
          <MenuItem
            onClick={handleClose}
            diagnoses={[{ id: row.id }]}
            component={DeleteDiagnoses}
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
