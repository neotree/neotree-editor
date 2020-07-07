import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import { FieldTypes } from '@/constants/types';
import Title from '../../Title';

const FieldForm = React.forwardRef(({
  children,
  onClick,
  data,
  onSave,
  form: { type },
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false);

  const [form, _setForm] = React.useState({
    calculation: null,
    condition: null,
    confidential: false,
    dataType: null,
    defaultValue: null,
    format: null,
    type: null,
    key: null,
    label: null,
    minValue: null,
    maxValue: null,
    values: null,
    optional: false,
    ...data,
  });

  const setForm = s => _setForm(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

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
        <DialogTitle>{data ? 'Edit' : 'Add'} field</DialogTitle>

        <DialogContent>
          <Collapse in={!form.type}>
            <Title>Screen type</Title>

            <RadioGroup name="type" value={type} onChange={e => setForm({ type: e.target.value })}>
              {FieldTypes.map(t => (
                <FormControlLabel
                  key={t.name}
                  value={t.name}
                  control={<Radio />}
                  label={t.label}
                />
              ))}
            </RadioGroup>
          </Collapse>

          <Collapse in={!!form.type}>
            <div>
              <Title>Flow control</Title>

              <div>
                <TextField
                  fullWidth
                  value={form.condition || ''}
                  label="Conditional expression"
                  onChange={e => setForm({ condition: e.target.value })}
                />
                <Typography
                  variant="caption"
                  color="textSecondary"
                >Example: <b>($key = true and $key2 = false) or $key3 = 'HD'</b></Typography>
              </div>
              <br />

              <Title>Properties</Title>

              <div>
                <TextField
                  fullWidth
                  // required
                  // error={!form.key}
                  value={form.key || ''}
                  label="Key"
                  onChange={e => setForm({ key: e.target.value })}
                />
              </div>
              <br />

              <div>
                <TextField
                  fullWidth
                  // required
                  // error={!form.label}
                  value={form.label || ''}
                  label="Label"
                  onChange={e => setForm({ label: e.target.value })}
                />
              </div>
              <br />

              <Grid container>
                <Grid item xs={6} sm={6}>
                  <div>
                    <FormControlLabel
                      control={(
                        <Switch
                          checked={!!form.confidential}
                          onChange={() => setForm({ confidential: !form.confidential })}
                          name="confidential"
                        />
                      )}
                      label="Confidential"
                    />
                  </div>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <div>
                    <FormControlLabel
                      control={(
                        <Switch
                          checked={!!form.optional}
                          onChange={() => setForm({ optional: !form.optional })}
                          name="optional"
                        />
                      )}
                      label="Optional"
                    />
                  </div>
                </Grid>
              </Grid>
              <br />

              {(() => {
                let opts = null;
                if (form.type === 'text') {
                  opts = [
                    { label: 'Generated ID', name: 'uid' },
                  ];
                } else if ((form.type === 'date') || form.type === 'datetime') {
                  opts = [
                    { label: 'Current time', name: 'date_now' },
                    { label: 'Today at noon', name: 'date_noon' },
                    { label: 'Today at midnight', name: 'date_midnight' },
                  ];
                }
                return !opts ? null : (
                  <>
                    <Title>Default</Title>

                    <RadioGroup name="type" value={type} onChange={e => setForm({ defaultValue: e.target.value })}>
                      <FormControlLabel
                        value=""
                        control={<Radio />}
                        label="Empty"
                      />
                      {opts.map(o => (
                        <FormControlLabel
                          key={o.name}
                          value={o.name}
                          control={<Radio />}
                          label={o.label}
                        />
                      ))}
                    </RadioGroup>
                  </>
                );
              })()}
            </div>
          </Collapse>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
          >Cancel</Button>

          <Button
            variant="contained"
            color="primary"
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

FieldForm.propTypes = {
  onClick: PropTypes.func,
  form: PropTypes.object.isRequired,
  children: PropTypes.node,
  data: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default FieldForm;
