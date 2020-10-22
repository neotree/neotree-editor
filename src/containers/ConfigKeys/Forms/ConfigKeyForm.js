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
  const [formError, setFormError] = React.useState(null);
  const [saveError, setSaveError] = React.useState(null);

  const defaultForm = { ...configKey };
  const [form, _setForm] = React.useState(defaultForm);
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  React.useEffect(() => { if (configKey) setForm(configKey); }, [configKey]);

  React.useEffect(() => { setForm(defaultForm); }, [open]);

  React.useEffect(() => {
    let e = null;
    if (!form.label) e = { ...e, label: 'Label is required' };
    if (!form.configKey) e = { ...e, configKey: 'Key is required' };
    setFormError(e ? e : null);
    setSaveError(null);
  }, [form]);

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
              required
              error={formError ? !!formError.label : false}
              value={form.configKey || ''}
              label="Key"
              onChange={e => setForm({ configKey: e.target.value })}
            />
          </div>

          <br />

          <div>
            <TextField
              fullWidth
              required
              error={formError ? !!formError.configKey : false}
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

          {!saveError ? null : (
            <div>
              <br />
              <Typography variant="caption" color="error">
                {JSON.stringify(saveError)}
              </Typography>
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
                disabled={!!formError}
                onClick={() => {
                  setSaving(true);
                  saveConfigKey(configKey, form, (e) => {
                    setSaving(false);
                    setSaveError(e);
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
