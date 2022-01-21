import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

export function ImportScript({ scriptId: updateScriptId }) {
  const [url, setURL] = React.useState('');
  const [importScriptId, setImportScriptId] = React.useState('');
  const [confirmOverride, setConfirmOverride] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [openModal, setOpenModal] = React.useState(false);
  const onClose = () => {
    if (importing) return;
    setOpenModal(false);
    setURL('');
    setImportScriptId('');
    setConfirmOverride(false);
  };

  React.useEffect(() => { setError(null); }, [url, importScriptId]);

  async function onImport() {
    try {
      setImporting(true);
      setError(null);
      const res = await fetch('/import-scripts', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ url, importScriptId, updateScriptId, }),
      });
      const json = await res.json();
      const e = json.error ? [json.error] : json.errors;
      if (e) throw new Error(e.map(e => e.message || e.msg || e).join('\n'));
      // onClose();
      window.location.reload();
    } catch (e) { setError(e.message); }
    setImporting(false);
  }

  return (
    <>
      <Button
        onClick={() => setOpenModal(true)}
        color="primary"
      >Import</Button>

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
            onChange={e => setURL(e.target.value)}
            label="Webeditor URL"
            fullWidth
            required
            error={!url}
            variant="outlined"
          />
          <Typography
            variant="caption"
            color="textSecondary"
          >e.g. <b>https://webeditor.neotree.org</b></Typography>
          <br /><br />

          <TextField
            value={importScriptId}
            onChange={e => setImportScriptId(e.target.value)}
            label="Script ID"
            fullWidth
            required
            error={!importScriptId}
            variant="outlined"
          />

          {!!updateScriptId && (
            <>
              <br /><br />
              <FormControlLabel 
                control={<Checkbox checked={confirmOverride} onChange={() => setConfirmOverride(override => !override)} />}
                label={(
                  <Typography
                    variant="caption"
                    color="error"
                  >Confirm that you'd like to override this script with the imported script</Typography>
                )}
              />
            </>
          )}

          {!!error && (
            <>
              <br /><br />
              <Typography
                variant="caption"
                color="error"
              >{error}</Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <div style={{ marginLeft: 'auto', }} />

          <Button
            onClick={onClose}
            disabled={importing}
          >Cancel</Button>&nbsp;

          <Button
            variant="contained"
            disableElevation
            color="secondary"
            disabled={importing || !(url && importScriptId && (updateScriptId ? confirmOverride : true))}
            onClick={onImport}
          >Import</Button>

          {importing && (
            <>
              &nbsp;<CircularProgress size={20} />
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

ImportScript.propTypes = {
    scriptId: PropTypes.string,
};
