import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogContent, DialogActions } from 'react-mdl';
import Api from 'AppUtils/Api';
import Spinner from 'ui/Spinner';

const Copy = ({ data, children, itemsType }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [script_id, setScriptId] = useState('');

  useEffect(() => {
    setError(null);
    if (open && !scriptsLoaded) {
      setLoading(true);

      Api.get('/get-scripts')
        .then(({ payload: { error, scripts } }) => {
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

  return (
    <>
      <div
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >{children || 'Copy'}</div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        {loading ?
          <DialogContent>
            <Spinner className="ui__flex ui__justifyContent_center" />
          </DialogContent>
          :
          <>
            <DialogContent>
              <p>Copy to</p>
              <select
                value={script_id || ''}
                style={{ maxWidth: 200 }}
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
                accent
                disabled={copying || !script_id}
                onClick={() => {
                  setCopying(true);
                  setError(null);
                  Api.post(`/copy-${itemsType}`, { ...data, script_id })
                    .then(({ error }) => {
                      setError(error);
                      setCopying(false);
                      setScriptId('');
                    })
                    .catch(err => {
                      setError(err);
                      setCopying(false);
                    });
                }}
              >Copy</Button>

              <Button
                disabled={copying}
                onClick={() => setOpen(false)}
              >Cancel</Button>

              {!error ? null : (
                <span style={{ color: '#b20008', fontSize: 15 }}>
                  {error.msg || error.message || JSON.stringify(error)}
                </span>
              )}
            </DialogActions>
          </>}
      </Dialog>
    </>
  );
};

Copy.propTypes = {
  children: PropTypes.node,
  itemsType: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
};

export default Copy;
