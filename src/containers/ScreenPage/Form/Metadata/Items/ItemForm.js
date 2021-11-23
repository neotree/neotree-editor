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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useAppContext } from '@/AppContext';
import TitleTextImageForm from '@/components/TitleTextImageForm';

const ItemForm = React.forwardRef(({
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
    dataType: (() => {
      switch (type) {
        case 'list':
          return 'void';
        case 'checklist':
          return 'boolean';
        case 'single_select':
          return 'id';
        case 'diagnosis':
          return 'diagnosis';
        default:
          return null;
      }
    })(),
    confidential: false,
    checked: null,
    id: null,
    label: null,
    key: null,
    exclusive: null,
    summary: null,
    image1: null,
    image2: null,
    image3: null,
    name: null,
    text1: null,
    text2: null,
    text3: null,
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
        <DialogTitle>{data ? 'Edit' : 'Add'} item</DialogTitle>

        <DialogContent>
          {(() => {
            switch (type) {
              case 'checklist':
                return (
                  <>
                    <div>
                      <TextField
                        fullWidth
                        required
                        error={!form.label}
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
                        // error={!form.summary}
                        value={form.summary || ''}
                        label="Summary"
                        onChange={e => setForm({ summary: e.target.value })}
                      />
                    </div>
                    <br />

                    <div>
                      <TextField
                        fullWidth
                        required
                        error={form.key && /[a-zA-Z0-9]+/.test(form.key) ? false : true}
                        value={form.key || ''}
                        label="Key"
                        onChange={e => setForm({ key: e.target.value })}
                      />
                    </div>
                    <br />

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
                    <br />

                    <div>
                      <FormControlLabel
                        control={(
                          <Switch
                            checked={!!form.exclusive}
                            onChange={() => setForm({ exclusive: !form.exclusive })}
                            name="exclusive"
                          />
                        )}
                        label="Disable other items if selected"
                      />
                    </div>
                  </>
                );

              case 'progress':
                return (
                  <>
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
                      <FormControlLabel
                        control={(
                          <Switch
                            checked={!!form.checked}
                            onChange={() => setForm({ checked: !form.checked })}
                            name="checked"
                          />
                        )}
                        label="Mark as checked"
                      />
                    </div>
                  </>
                );

              case 'list':
                return (
                  <>
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
                    <br /><br />

                    <div>
                      <TextField
                        fullWidth
                        // required
                        // error={!form.summary}
                        value={form.summary || ''}
                        label="Summary"
                        onChange={e => setForm({ summary: e.target.value })}
                      />
                    </div>
                    <br /><br />
                  </>
                );

              default:
                return (
                  <>
                    <Grid container spacing={1}>
                      <Grid item xs={2} sm={2}>
                        <TextField
                          fullWidth
                          // required
                          // error={!form.id}
                          value={form.id || ''}
                          label="ID"
                          onChange={e => setForm({ id: e.target.value })}
                        />
                      </Grid>

                      <Grid item xs={10} sm={10}>
                        <TextField
                          fullWidth
                          // required
                          // error={!form.label}
                          value={form.label || ''}
                          label="Label"
                          onChange={e => setForm({ label: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                    <br />

                    {['multi_select', 'diagnosis'].includes(type) && (
                      <>
                        <div>
                          <FormControlLabel
                            control={(
                              <Switch
                                checked={!!form.exclusive}
                                onChange={() => setForm({ exclusive: !form.exclusive })}
                                name="exclusive"
                              />
                            )}
                            label="Disable other items if selected"
                          />
                        </div>

                        {/* {type === 'diagnosis' && (
                          <>
                            <TitleTextImageForm
                              noTitle
                              labels={{ text: 'Text 1', image: 'Image 1', }}
                              value={{ text: form.text1, image: form.image1, }}
                              onChange={({ text, image }) => setForm({
                                text1: text,
                                image1: image,
                              })}
                            />
                            <br /><br />

                            <TitleTextImageForm
                              noTitle
                              labels={{ text: 'Text 2', image: 'Image 2', }}
                              value={{ text: form.text2, image: form.image2, }}
                              onChange={({ text, image }) => setForm({
                                text2: text,
                                image2: image,
                              })}
                            />
                            <br /><br />

                            <TitleTextImageForm
                              noTitle
                              labels={{ text: 'Text 3', image: 'Image 3', }}
                              value={{ text: form.text3, image: form.image3, }}
                              onChange={({ text, image }) => setForm({
                                text3: text,
                                image3: image,
                              })}
                            />
                            <br /><br />
                          </>
                        )} */}
                      </>
                    )}
                  </>
                );
            }
          })()}
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

ItemForm.propTypes = {
  onClick: PropTypes.func,
  form: PropTypes.object.isRequired,
  children: PropTypes.node,
  data: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default ItemForm;
