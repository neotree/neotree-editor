import React from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { useAppContext } from '@/AppContext';
import ItemForm from './ItemForm';

function ItemRowActions({ row, rowIndex, form, setMetadata, }) {
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
          component={ItemForm}
          form={form}
          data={row}
          onSave={v => setMetadata({
            items: form.metadata.items
              .map((item, i) => rowIndex === i ? { ...item, ...v } : item)
          })}
        >{viewMode === 'view' ? 'View' : 'Edit'}</MenuItem>

        {viewMode === 'view' ? null : (
          <MenuItem
            onClick={e => {
              setMetadata({
                items: form.metadata.items.filter((item, i) => i !== rowIndex),
              });
              handleClose(e);
            }}
          >
            <Typography color="error">Delete</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

ItemRowActions.propTypes = {
  rowIndex: PropTypes.number,
  row: PropTypes.object,
  form: PropTypes.object,
  setMetadata: PropTypes.func.isRequired,
};

export default ItemRowActions;
