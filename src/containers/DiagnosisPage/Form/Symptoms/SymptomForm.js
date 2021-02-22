import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import { useAppContext } from '@/AppContext';
import { SymptomTypes } from '@/constants/types';

const SymptomForm = React.forwardRef(({
  children,
  onClick,
  data,
  onSave,
  // form: { type },
  ...props
}, ref) => {
  const { state: { viewMode } } = useAppContext();
  const [open, setOpen] = React.useState(false);

  const defaultForm = {
    name: null,
    expression: null,
    type: SymptomTypes[0].name || '',
    weight: null,
    ...data,
  };
  const [form, _setForm] = React.useState(defaultForm);
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  React.useEffect(() => { setForm(defaultForm); }, [open]);

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
        onClose={() => setOpen(false)}
      >
        <DialogTitle>{data ? 'Edit' : 'Add'} symptom</DialogTitle>

        <DialogContent>
          <RadioGroup name="type" value={form.type} onChange={e => setForm({ type: e.target.value })}>
            {SymptomTypes.map(t => (
              <FormControlLabel
                key={t.name}
                value={t.name}
                control={<Radio />}
                label={t.label}
              />
            ))}
          </RadioGroup>
          <br /><br />

          <div>
            <TextField
              fullWidth
              required
              error={!form.name}
              value={form.name || ''}
              label="Name"
              onChange={e => setForm({ name: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              value={form.weight || ''}
              label="Weight"
              onChange={e => setForm({ weight: e.target.value })}
            />
            <Typography
              variant="caption"
              color="textSecondary"
            >Must be in the range: 0.0 - 1.0 (<b>default 1.0</b>)</Typography>
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              value={form.expression || ''}
              label="Sign/Risk expression"
              onChange={e => setForm({ expression: e.target.value })}
            />
            <Typography
              variant="caption"
              color="textSecondary"
            >Example: <b>($key = true and $key2 = false) or $key3 = 'HD'</b></Typography>
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
          >Cancel</Button>

          <Button
            variant="contained"
            color="primary"
            disabled={viewMode === 'view'}
            onClick={() => {
              onSave(form);
              setOpen(false);
            }}
          >Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

SymptomForm.propTypes = {
  onClick: PropTypes.func,
  form: PropTypes.object.isRequired,
  children: PropTypes.node,
  data: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default SymptomForm;
