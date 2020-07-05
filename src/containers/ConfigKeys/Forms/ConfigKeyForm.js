import React from 'react';
import PropTypes from 'prop-types';
import { useConfigKeysContext } from '@/contexts/config-keys';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

const ConfigKeyForm = React.forwardRef(({
  children,
  onClick,
  configKey,
  ...props
}, ref) => {
  const { saveConfigKey } = useConfigKeysContext();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [form, _setForm] = React.useState(configKey ? configKey.data : {});
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  React.useEffect(() => { if (configKey) setForm(configKey.data); }, [configKey]);

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
        maxWidth="sm"
        fullWidth
        onClose={() => saving ? null : setOpen(false)}
      >
        <DialogTitle>{configKey ? 'Edit' : 'Add'} config key</DialogTitle>

        <DialogContent>
          <div>
            <TextField
              fullWidth
              value={form.configKey || ''}
              label="Key"
              onChange={e => setForm({ configKey: e.target.value })}
            />
          </div>

          <br />

          <div>
            <TextField
              fullWidth
              value={form.label || ''}
              label="Label"
              onChange={e => setForm({ label: e.target.value })}
            />
          </div>

          <br />

          <div>
            <TextField
              fullWidth
              value={form.summary || ''}
              label="Summary"
              onChange={e => setForm({ summary: e.target.value })}
            />
          </div>

          {!error ? null : (
            <div>
              <br />
              <Typography variant="caption" color="error">{JSON.stringify(error)}</Typography>
            </div>
          )}
        </DialogContent>

        <DialogActions>
          {saving ? (
            <Button>
              <CircularProgress size={20} />
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setOpen(false)}
              >Cancel</Button>

              <Button
                variant="contained"
                color="primary"
                disabled={!(form.configKey && form.label)}
                onClick={() => {
                  setSaving(true);
                  saveConfigKey(configKey, form, (e) => {
                    setSaving(false);
                    setError(e);
                    setOpen(false);
                  });
                }}
              >Save</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
});

ConfigKeyForm.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  configKey: PropTypes.object,
};

export default ConfigKeyForm;
