import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import Fab from '@material-ui/core/Fab';
import FabWrap from '@/components/FabWrap';
import DeleteScripts from './Forms/DeleteScripts';
import DuplicateScripts from './Forms/DuplicateScripts';

function ImportScript() {
  const [url, setURL] = React.useState('');
  const [scriptId, setScriptId] = React.useState('');
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [openModal, setOpenModal] = React.useState(false);
  const onClose = () => {
    if (importing) return;
    setOpenModal(false);
    setURL('');
    setScriptId('');
  };

  React.useEffect(() => { setError(null); }, [url, scriptId]);

  async function onImport() {
    try {
      setImporting(true);
      setError(null);
      const res = await fetch('/import-scripts', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ url, scriptId, }),
      });
      const json = await res.json();
      const e = json.error ? [json.error] : json.errors;
      if (e) throw new Error(e.map(e => e.message || e.msg || e).join('\n'));
      // onClose();
      // window.location.reload();
    } catch (e) { setError(e.message); }
    setImporting(false);
  }

  return (
    <>
      <Button
        onClick={() => setOpenModal(true)}
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
          />
          <Typography
            variant="caption"
            color="textSecondary"
          >e.g. <b>https://webeditor.neotree.org</b></Typography>
          <br /><br />

          <TextField
            value={scriptId}
            onChange={e => setScriptId(e.target.value)}
            label="Script ID"
            fullWidth
            required
            error={!scriptId}
          />

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
            disabled={importing || !(url && scriptId)}
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

function Actions({ selected }) {
  return (
    <>
      {selected.length > 0 && (
        <>
          <DuplicateScripts scripts={selected.map(({ row }) => ({ scriptId: row.scriptId }))}>
            <Button>Duplicate</Button>
          </DuplicateScripts>

          <DeleteScripts scripts={selected.map(({ row }) => ({ scriptId: row.scriptId }))}>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </DeleteScripts>
        </>
      )}

      <ImportScript />&nbsp;

      <Link to="/scripts/new">
        <Tooltip title="New script">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Link>

      <FabWrap>
        <Link to="/scripts/new">
          <Fab color="secondary">
            <AddIcon />
          </Fab>
        </Link>
      </FabWrap>
    </>
  );
}

Actions.propTypes = {
  selected: PropTypes.array.isRequired
};

export default params => <Actions {...params} />;
