import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Title from './Title';
import MetadataManagement from './Metadata/Management';
import MetadataTimer from './Metadata/Timer';
import MetadataYesNo from './Metadata/YesNo';
import MetadataSelect from './Metadata/Select';

function Properties(props) {
  const { setForm, form } = props;
  React.useEffect(() => {
    setForm({
      epicId: null,
      storyId: null,
      refId: null,
      step: null,
      title: null,
      sectionTitle: null,
      actionText: null,
      contentText: null,
      instructions: null,
      notes: null,
      ...form,
    });
  }, []);

  return (
    <>
      <Title>Properties</Title>

      <Grid container spacing={1}>
        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.epicId || ''}
            label="Epic ID"
            onChange={e => setForm({ epicId: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.storyId || ''}
            label="Story ID"
            onChange={e => setForm({ storyId: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.refId || ''}
            label="Ref."
            onChange={e => setForm({ refId: e.target.value })}
          />
        </Grid>

        <Grid xs={6} sm={3} item>
          <TextField
            fullWidth
            value={form.step || ''}
            label="Step"
            onChange={e => setForm({ step: e.target.value })}
          />
        </Grid>
      </Grid>
      <br /><br />

      <div>
        <TextField
          fullWidth
          required
          error={!form.title}
          value={form.title || ''}
          label="Title"
          onChange={e => setForm({ title: e.target.value })}
        />
      </div>
      <br /><br />

      <div>
        <TextField
          fullWidth
          required
          error={!form.sectionTitle}
          value={form.sectionTitle || ''}
          label="Print section title"
          onChange={e => setForm({ sectionTitle: e.target.value })}
        />
      </div>
      <br /><br />

      <div>
        <TextField
          fullWidth
          value={form.actionText || ''}
          label="Action"
          onChange={e => setForm({ actionText: e.target.value })}
        />
      </div>
      <br /><br />

      <div>
        <TextField
          rows={5}
          multiline
          fullWidth
          value={form.contentText || ''}
          label="Content"
          onChange={e => setForm({ contentText: e.target.value })}
        />
      </div>
      <br /><br />

      {(() => {
        let Component = null;

        switch (form.type) {
          case 'yesno':
            Component = MetadataYesNo;
            break;
          case 'timer':
            Component = MetadataTimer;
            break;
          case 'management':
            Component = MetadataManagement;
            break;
          case 'multi_select':
            Component = MetadataSelect;
            break;
          case 'single_select':
            Component = MetadataSelect;
            break;
          default:
            // do nothing
        }

        return !Component ? null : (
          <>
            <Component {...props} />
            <br />
          </>
        );
      })()}

      <div>
        <TextField
          rows={5}
          multiline
          fullWidth
          value={form.instructions || ''}
          label="Instructions"
          onChange={e => setForm({ instructions: e.target.value })}
        />
      </div>
      <br /><br />

      <div>
        <TextField
          rows={5}
          multiline
          fullWidth
          value={form.notes || ''}
          label="Notes"
          onChange={e => setForm({ notes: e.target.value })}
        />
      </div>
      <br /><br />
    </>
  );
}

Properties.propTypes = {
  screen: PropTypes.object,
  script: PropTypes.object,
  form: PropTypes.object,
  setForm: PropTypes.func,
};

export default Properties;
