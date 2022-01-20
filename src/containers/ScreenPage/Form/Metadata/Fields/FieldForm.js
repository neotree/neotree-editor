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
import { DateTimePicker, TimePicker, } from '@material-ui/pickers';
import Checkbox from '@material-ui/core/Checkbox';
import { useAppContext } from '@/AppContext';
import Title from '../../Title';

const FieldForm = React.forwardRef(({
  children,
  onClick,
  data,
  onSave,
  form: { type },
  ...props
}, ref) => {
  const { state: { viewMode } } = useAppContext();
  const [open, setOpen] = React.useState(false);

  const defaultForm = {
    calculation: null,
    condition: null,
    confidential: false,
    dataType: null,
    defaultValue: null,
    format: null,
    type: null,
    key: null,
    refKey: null,
    label: null,
    minValue: null,
    maxValue: null,
    values: null,
    optional: false,
    minDate: null,
    maxDate: null,
    minTime: null,
    maxTime: null,
    minDateKey: '',
    maxDateKey: '',
    minTimeKey: '',
    maxTimeKey: '',
    ...data,
  };
  const [form, _setForm] = React.useState(defaultForm);
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  React.useEffect(() => { setForm(defaultForm); }, [open]);

  const renderDefaultsSection = opts => !opts ? null : (
    <>
      <Title>Default</Title>

      <RadioGroup name="type" value={form.defaultValue} onChange={e => setForm({ defaultValue: e.target.value })}>
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
      <br />
    </>
  );

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
                  required
                  error={/[a-zA-Z0-9]+/.test(form.key) ? false : true}
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

              <div>
                <TextField
                  fullWidth
                  // required
                  // error={!form.label}
                  value={form.refKey || ''}
                  label="Reference key"
                  onChange={e => setForm({ refKey: e.target.value })}
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

              {form.type === 'text' && (
                <>
                  {renderDefaultsSection([
                    { label: 'Generated ID', name: 'uid' },
                  ])}
                </>
              )}

              {form.type === 'time' && (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={6}>
                      <TimePicker
                        ampm={false}
                        label="Min time"
                        fullWidth
                        disabled={form.minTime === 'time_now'}
                        value={form.minTime === 'time_now' ? null : form.minTime}
                        onChange={minTime => setForm({ minTime })}
                      />

                      <FormControlLabel
                        label="Current time"
                        control={(
                          <Checkbox
                            size="small"
                            checked={form.minTime === 'time_now'}
                            onChange={e => setForm({ minTime: e.target.checked ? 'time_now' : null })}
                          />
                        )}
                      />

                      {/* <div>
                        <TextField
                          fullWidth
                          value={form.minTimeKey || ''}
                          label="Min Time Key (e.g $TimeOfBirth)"
                          onChange={e => setForm({ minTimeKey: e.target.value })}
                        />
                      </div>
                      <br /> */}
                    </Grid>

                    <Grid item xs={6} sm={6}>
                      <TimePicker
                        ampm={false}
                        label="Max time"
                        fullWidth
                        disabled={form.maxTime === 'time_now'}
                        value={form.maxTime === 'time_now' ? null : form.maxTime}
                        onChange={maxTime => setForm({ maxTime })}
                      />

                      <FormControlLabel
                        label="Current time"
                        control={(
                          <Checkbox
                            size="small"
                            checked={form.maxTime === 'time_now'}
                            onChange={e => setForm({ maxTime: e.target.checked ? 'time_now' : null })}
                          />
                        )}
                      />

                      {/* <div>
                        <TextField
                          fullWidth
                          value={form.maxTimeKey || ''}
                          label="Max Time Key (e.g $TimeOfBirth)"
                          onChange={e => setForm({ maxTimeKey: e.target.value })}
                        />
                      </div>
                      <br /> */}
                    </Grid>
                  </Grid>
                  <br /><br />
                </>
              )}

              {((form.type === 'date') || (form.type === 'datetime')) && (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={6}>
                      <DateTimePicker
                        ampm={false}
                        label="Min date"
                        fullWidth
                        disabled={form.minDate === 'date_now'}
                        value={form.minDate === 'date_now' ? null : form.minDate}
                        onChange={minDate => setForm({ minDate })}
                      />

                      <FormControlLabel
                        label="Current date"
                        control={(
                          <Checkbox
                            size="small"
                            checked={form.minDate === 'date_now'}
                            onChange={e => setForm({ minDate: e.target.checked ? 'date_now' : null })}
                          />
                        )}
                      />

                      <div>
                        <TextField
                          fullWidth
                          value={form.minDateKey || ''}
                          label="Min Date Key (e.g. $DateOfBirth)"
                          onChange={e => setForm({ minDateKey: e.target.value })}
                        />
                      </div>
                      <br />
                    </Grid>

                    <Grid item xs={6} sm={6}>
                      <DateTimePicker
                        ampm={false}
                        label="Max date"
                        fullWidth
                        disabled={form.maxDate === 'date_now'}
                        value={form.maxDate === 'date_now' ? null : form.maxDate}
                        onChange={maxDate => setForm({ maxDate })}
                      />

                      <FormControlLabel
                        label="Current date"
                        control={(
                          <Checkbox
                            size="small"
                            checked={form.maxDate === 'date_now'}
                            onChange={e => setForm({ maxDate: e.target.checked ? 'date_now' : null })}
                          />
                        )}
                      />

                      <div>
                        <TextField
                          fullWidth
                          value={form.maxDateKey || ''}
                          label="Max Date Key (e.g. $DateOfBirth)"
                          onChange={e => setForm({ maxDateKey: e.target.value })}
                        />
                      </div>
                      <br />
                    </Grid>
                  </Grid>
                  <br /><br />

                  {renderDefaultsSection([
                    { label: 'Current time', name: 'date_now' },
                    { label: 'Today at noon', name: 'date_noon' },
                    { label: 'Today at midnight', name: 'date_midnight' },
                  ])}
                </>
              )}

            {form.type === 'dropdown' && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  value={form.values || ''}
                  label="Dropdown values"
                  onChange={e => setForm({ values: e.target.value })}
                />
              </>
            )}

            {form.type === 'period' && (
              <>
                <TextField
                  fullWidth
                  required
                  error={/(\$[a-zA-Z0-9]+)+(\s*-\s*(\$[a-zA-Z0-9]+))?/.test(form.calculation) ? false : true}
                  value={form.calculation || ''}
                  label="Reference expression"
                  onChange={e => setForm({ calculation: e.target.value })}
                />
                <Typography
                  variant="caption"
                  color="textSecondary"
                >Example: <b>$key</b></Typography>
              </>
            )}

            {form.type === 'number' && (
              <>
                <Grid container spacing={1}>
                  <Grid item xs={4} sm={4}>
                    <TextField
                      fullWidth
                      error={/#*/.test(form.format) ? false : true}
                      value={form.format || ''}
                      label="Format"
                      onChange={e => setForm({ format: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <TextField
                      fullWidth
                      error={/-?[0-9]*(\.[0-9]+)?/.test(form.minValue) ? false : true}
                      value={form.minValue || ''}
                      label="Min value"
                      onChange={e => setForm({ minValue: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <TextField
                      fullWidth
                      error={/-?[0-9]*(\.[0-9]+)?/.test(form.maxValue) ? false : true}
                      value={form.maxValue || ''}
                      label="Max value"
                      onChange={e => setForm({ maxValue: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Typography
                  variant="caption"
                  color="textSecondary"
                >Format: Add as many <b>#</b> as the number of decimal digits or leave empty</Typography>
              </>
            )}
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

FieldForm.propTypes = {
  onClick: PropTypes.func,
  form: PropTypes.object.isRequired,
  children: PropTypes.node,
  data: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default FieldForm;
