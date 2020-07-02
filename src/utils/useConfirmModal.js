import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

export default () => {
  const [open, setOpen] = React.useState(false);

  const confirm = () => setOpen(true);

  const renderConfirmModal = (opts = {}) => {
    const {
      title,
      message,
      confirmButtonText,
      cancelButtonText,
      onConfirm,
      onCancel
    } = opts;

    const _onCancel = () => {
      if (onCancel) onCancel();
      setOpen(false);
    };

    return (
      <Dialog
        open={open}
        onClose={() => _onCancel()}
      >
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => _onCancel()}
          >{cancelButtonText || 'No'}</Button>

          <Button
            size="small"
            color="secondary"
            onClick={() => {
              if (onConfirm) onConfirm();
              setOpen(false);
            }}
          >{confirmButtonText || 'Yes'}</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return [renderConfirmModal, confirm];
};
