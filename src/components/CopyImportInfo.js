import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

export function CopyImportInfo({ children, scriptId }) {
  const [url] = React.useState(window.location.origin);
  const [importScriptId] = React.useState(scriptId || '');
  const [openModal, setOpenModal] = React.useState(false);
  const onClose = () => {
    setOpenModal(false);
  };
  const onOpen = () => setOpenModal(true);

  return (
    <>
      <div onClick={onOpen}>{children}</div>

      <Dialog
        open={openModal}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Import script</DialogTitle>

        <DialogContent>
          <TextField
            value={url}
            onChange={e => {}}
            label="URL"
            fullWidth
            variant="outlined"
            onFocus={e => console.log(e.target.select)}
          />
          <br /><br />

          <TextField
            value={importScriptId}
            onChange={e => {}}
            label="Script ID"
            fullWidth
            variant="outlined"
            onFocus={e => console.log(e.target.select)}
          />
        </DialogContent>

        <DialogActions>
          <div style={{ marginLeft: 'auto', }} />

          <Button
            onClick={onClose}
          >Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CopyImportInfo.propTypes = {
    scriptId: PropTypes.string,
    children: PropTypes.node,
};
