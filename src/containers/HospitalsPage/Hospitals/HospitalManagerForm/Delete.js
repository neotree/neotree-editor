import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import * as api from '@/api/hospitals';

const Delete = ({ hospital, updateState, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openConfirmDialog, _setOpenConfirmDialog] = useState(false);
  const setOpenConfirmDialog = open => {
    if (loading) return;
    setError(null);
    _setOpenConfirmDialog(open);
  };

  return (
    <>
      <IconButton
        size="small"
        disabled={disabled === true}
        onClick={() => setOpenConfirmDialog(true)}
      >
        <DeleteIcon />
      </IconButton>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <Typography>Are you sure you want to delete <b>{hospital.email}</b>?</Typography>
        </DialogContent>

        <DialogActions>
          {!error ? null :
            <Typography
              variant="caption"
              color="error"
              style={{ marginRight: 'auto' }}
            >{error.msg || error.message || JSON.stringify(error)}</Typography>}
          <Button
            disabled={loading}
            onClick={() => setOpenConfirmDialog(false)}
          >Cancel</Button>
          <Button
            disabled={loading}
            color="secondary"
            onClick={() => {
              setLoading(true);
              api.deleteHospital({ id: hospital.id })
                .then(() => {
                  setLoading(false);
                  setOpenConfirmDialog(false);
                  updateState(({ hospitals }) => ({ hospitals: hospitals.filter(u => u.id !== hospital.id) }));
                })
                .catch(err => {
                  setLoading(false);
                  setError(err);
                });
            }}
          >{loading ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Delete.propTypes = {
  hospital: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default Delete;
