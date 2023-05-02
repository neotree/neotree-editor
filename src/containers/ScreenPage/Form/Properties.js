import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Title from './Title';
import MetadataManagement from './Metadata/Management';
import MetadataTimer from './Metadata/Timer';
import MetadataYesNo from './Metadata/YesNo';
import MetadataSelect from './Metadata/Select';
import MetadataKeyLabel from './Metadata/KeyLabel';

function Properties(props) {
  const { setForm, form } = props;
  React.useEffect(() => {
    setForm({
      epicId: null,
      storyId: null,
      refId: null,
      step: null,
      title: null,
      title2: null,
      title3: null,
      title4: null,
      sectionTitle: null,
      actionText: null,
      contentText: null,
      instructions: null,
      instructions2: null,
      instructions3: null,
      instructions4: null,
      hcwDiagnosesInstructions: null,
      suggestedDiagnosesInstructions: null,
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

      {form.type === 'diagnosis' && (
        <>
          <div>
            <TextField
              fullWidth
              required
              error={!form.title2}
              value={form.title2 || ''}
              label="Title 2"
              onChange={e => setForm({ title2: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              required
              error={!form.title3}
              value={form.title3 || ''}
              label="Title 3"
              onChange={e => setForm({ title3: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              required
              error={!form.title4}
              value={form.title4 || ''}
              label="Title 4"
              onChange={e => setForm({ title4: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              required
              error={!form.previewTitle}
              value={form.previewTitle || ''}
              label="Preview title"
              onChange={e => setForm({ previewTitle: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              required
              error={!form.previewPrintTitle}
              value={form.previewPrintTitle || ''}
              label="Preview print section title"
              onChange={e => setForm({ previewPrintTitle: e.target.value })}
            />
          </div>
          <br /><br />
        </>
      )}

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
          minRows={5}
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
          case 'edliz_summary_table':
            Component = MetadataKeyLabel;
            break;
          case 'mwi_edliz_summary_table':
            Component = MetadataKeyLabel;
            break;
          case 'zw_edliz_summary_table':
            Component = MetadataKeyLabel;
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
          minRows={5}
          multiline
          fullWidth
          value={form.instructions || ''}
          label="Instructions"
          onChange={e => setForm({ instructions: e.target.value })}
        />
      </div>
      <br /><br />

      {form.type === 'diagnosis' && (
        <>
          <div>
            <TextField
              minRows={5}
              multiline
              fullWidth
              value={form.instructions2 || ''}
              label="Instructions 2"
              onChange={e => setForm({ instructions2: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              minRows={5}
              multiline
              fullWidth
              value={form.instructions3 || ''}
              label="Instructions 3"
              onChange={e => setForm({ instructions3: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              minRows={5}
              multiline
              fullWidth
              value={form.instructions4 || ''}
              label="Instructions 4"
              onChange={e => setForm({ instructions4: e.target.value })}
            />
          </div>
          <br /><br />

          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <div>
                <TextField
                  minRows={5}
                  multiline
                  fullWidth
                  value={form.hcwDiagnosesInstructions || ''}
                  label="HCW diagnoses instructions"
                  onChange={e => setForm({ hcwDiagnosesInstructions: e.target.value })}
                />
              </div>
              <br /><br />
            </Grid>

            <Grid item xs={12} sm={6}>
              <div>
                <TextField
                  minRows={5}
                  multiline
                  fullWidth
                  value={form.suggestedDiagnosesInstructions || ''}
                  label="Suggested diagnoses instructions"
                  onChange={e => setForm({ suggestedDiagnosesInstructions: e.target.value })}
                />
              </div>
              <br /><br />
            </Grid>
          </Grid>
        </>
      )}

      <div>
        <TextField
          minRows={5}
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
