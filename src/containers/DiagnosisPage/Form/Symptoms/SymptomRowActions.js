import React from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SymptomForm from './SymptomForm';

function SymptomRowActions({ row, rowIndex, form, setForm, }) {
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
          component={SymptomForm}
          form={form}
          data={row}
          onSave={v => setForm({
            symptoms: form.symptoms
              .map((symptom, i) => rowIndex === i ? { ...symptom, ...v } : symptom)
          })}
        >Edit</MenuItem>

        <MenuItem
          onClick={e => {
            setForm({
              symptoms: form.symptoms.filter((symptom, i) => i !== rowIndex),
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

SymptomRowActions.propTypes = {
  rowIndex: PropTypes.number,
  row: PropTypes.object,
  form: PropTypes.object,
  setForm: PropTypes.func.isRequired,
};

export default SymptomRowActions;
