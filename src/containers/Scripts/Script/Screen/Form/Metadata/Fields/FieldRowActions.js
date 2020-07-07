import React from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FieldForm from './FieldForm';

function FieldRowActions({ row, rowIndex, form, setMetadata, }) {
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
          component={FieldForm}
          form={form}
          data={row}
          onSave={v => setMetadata({
            fields: form.metadata.fields
              .map((field, i) => rowIndex === i ? { ...field, ...v } : field)
          })}
        >Edit</MenuItem>

        <MenuItem
          onClick={e => {
            setMetadata({
              fields: form.metadata.fields.filter((field, i) => i !== rowIndex),
            });
            handleClose(e);
          }}
        >
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

FieldRowActions.propTypes = {
  rowIndex: PropTypes.number,
  row: PropTypes.object,
  form: PropTypes.object,
  setMetadata: PropTypes.func.isRequired,
};

export default FieldRowActions;
