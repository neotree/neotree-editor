import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as api from '@/api/scripts';

const CopyScriptItems = React.forwardRef(({
  children,
  ids,
  type,
  onClick,
  onSuccess,
  ...props
}, ref) => {
  const copyMultiple = ids.length > 1;
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [scriptsLoaded, setScriptsLoaded] = React.useState(false);
  const [scripts, setScripts] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [copying, setCopying] = React.useState(false);
  const [script_id, setScriptId] = React.useState('');
  const [displaySuccessModal, setDisplaySuccessModal] = React.useState(false);

  React.useEffect(() => {
    setError(null);
    setScriptId(null);
    if (open && !scriptsLoaded) {
      setLoading(true);

      api.getScripts()
        .then(({ error, scripts, }) => {
          if (error) return setError(error);
          setScripts(scripts);
          setScriptsLoaded(true);
          setLoading(false);
        })
        .then(err => {
          setError(err);
          setLoading(false);
        });
    }
  }, [open]);

  const itemsLabel = copyMultiple ? type === 'diagnosis' ? 'diagnoses' : 'screens' : type;

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          setOpen(true);
          if (onClick) onClick(e);
        }}
      >
        {children}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Copy {itemsLabel}</DialogTitle>

        {loading ?
          <DialogContent>
            <div style={{ textAlign: 'center' }}><CircularProgress /></div>
          </DialogContent>
          :
          <>
            <DialogContent>
              <Typography>Copy to</Typography>
              <select
                value={script_id || ''}
                style={{
                  maxWidth: 200,
                  background: 'transparent',
                  border: '1px solid #ddd',
                  padding: 10,
                  outline: 'none !important'
                }}
                onChange={e => setScriptId(e.target.value)}
              >
                <option value="">Select script</option>
                {scripts.map((scr, i) => (
                  <option key={i} value={scr.id}>
                    {scr.data.title}
                  </option>
                ))}
              </select>
            </DialogContent>

            <DialogActions>
              <Button
                  disabled={copying}
                  onClick={() => setOpen(false)}
                >Cancel</Button>

              <Button
                color="primary"
                variant="contained"
                disabled={copying || !script_id}
                onClick={() => {                  
                  let copy = null;
                  switch (type) {
                    case 'screen': 
                      copy = api.copyScreens;
                      break;
                    case 'diagnosis':
                      copy = api.copyDiagnoses;
                      break;
                    default:
                      // do nothing
                  }
                  if (!copy) return;

                  setCopying(true);
                  setError(null);

                  copy({ ids, script_id, })
                    .then(({ error, items, }) => {
                      setError(error);
                      setCopying(false);
                      setScriptId('');
                      if (onSuccess) onSuccess(items, script_id);
                      setDisplaySuccessModal(true);
                    })
                    .catch(err => {
                      setError(err);
                      setCopying(false);
                    });
                }}
              >Copy</Button>

              {!error ? null : (
                <Typography variant="caption" color="error">
                  {error.msg || error.message || JSON.stringify(error)}
                </Typography>
              )}
            </DialogActions>
          </>}
      </Dialog>

      <Dialog
        open={displaySuccessModal}
        onClose={() => setDisplaySuccessModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <div style={{ textAlign: 'center' }}>
            <Typography>Copied <b>{itemsLabel}</b> successfully.</Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            accent
            onClick={() => {
              setOpen(false);
              setDisplaySuccessModal(false);
            }}
          >OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

CopyScriptItems.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
  onSuccess: PropTypes.func,
  type: PropTypes.oneOfType(['screen', 'diagnosis']).isRequired,
};

export default CopyScriptItems;
