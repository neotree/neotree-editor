/* global alert, fetch, window */
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
  items,
  type,
  onClick,
  onSuccess,
  ...props
}, ref) => {
  const copyMultiple = items.length > 1;
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [scriptsLoaded, setScriptsLoaded] = React.useState(false);
  const [scripts, setScripts] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [copying, setCopying] = React.useState(false);
  const [scriptId, setScriptId] = React.useState('');
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
                value={scriptId || ''}
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
                  <option key={i} value={scr.scriptId}>
                    {scr.title}
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
                disabled={copying || !scriptId}
                onClick={() => {                  
                  let copyEndpoint = null;
                  switch (type) {
                    case 'screen': 
                      copyEndpoint = '/copy-screens';
                      break;
                    case 'diagnosis':
                      copyEndpoint = '/copy-diagnoses';
                      break;
                    default:
                      // do nothing
                  }
                  if (!copyEndpoint) return;

                  (async () => {
                    setCopying(true);
                    try {
                      const res = await fetch(copyEndpoint, {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        body: JSON.stringify({ items, targetScriptId: scriptId }),
                      });
                      const { errors } = await res.json();
                      if (errors && errors.length) {
                        alert(JSON.stringify(errors));
                      } else {
                        if (onSuccess) onSuccess(items, scriptId);
                      }
                    } catch (e) { alert(e.message); }
                    setCopying(false);
                  })();
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
  items: PropTypes.arrayOf(PropTypes.shape({
    diagnosisId: PropTypes.string,
    screenId: PropTypes.string,
    scriptId: PropTypes.string.isRequired,
  })).isRequired,
  onSuccess: PropTypes.func,
  type: PropTypes.oneOf(['screen', 'diagnosis']).isRequired,
};

export default CopyScriptItems;
