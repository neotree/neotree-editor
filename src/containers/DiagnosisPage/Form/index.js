/* global fetch, alert, window */
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import TitleTextImageForm from '@/components/TitleTextImageForm';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';
import UploadFilesPrompt from '@/components/UploadFilesPrompt';
import OverlayLoader from '@/components/OverlayLoader';
import { useAppContext } from '@/AppContext';
import Symptoms from './Symptoms';

function DiagnosisEditor({ diagnosis, script }) {
  const { state: { viewMode } } = useAppContext();

  const history = useHistory();
  const { scriptId } = useParams();

  const [form, _setForm] = React.useState({
    severity_order: null,
    description: null,
    expression: null,
    expressionMeaning: null,
    image1: null,
    image2: null,
    image3: null,
    name: null,
    text1: null,
    text2: null,
    text3: null,
    symptoms: [],
    scriptId,
    ...diagnosis,
    severity_order: `${diagnosis?.severity_order || ''}`
  });
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const [savingDiagnosis, setSavingDiagnosis] = React.useState(false);

  const canSaveDiagnosis = () => form.name && !savingDiagnosis;

  const saveDiagnosis = React.useCallback((opts = {}) => {
    const { redirectOnSuccess, form: _form } = opts;
    (async () => {
      setSavingDiagnosis(true);
      try {
        let res = await fetch(diagnosis ? '/update-diagnosis' : '/create-diagnosis', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ ...form, ..._form }),
        });
        res = await res.json();
        if (res.errors && res.errors.length) return alert(JSON.stringify(res.errors));
        if (redirectOnSuccess !== false) history.push(`/scripts/${scriptId}/diagnoses`);
      } catch (e) { alert(e.message); }
      setSavingDiagnosis(false);
    })();
  });

  return (
    <>
        <UploadFilesPrompt 
          data={form}
          save={files => {
            const _form = { ...form, ...files };
            setForm(_form);
            saveDiagnosis({ redirectOnSuccess: false, form: _form });
          }}
        />

      <Card>
        <CardContent>
          <TitleWithBackArrow 
            backLink={diagnosis ? `/scripts/${diagnosis.scriptId}/diagnoses` : null}
            title={`${diagnosis ? 'Edit' : 'Add'} diagnosis`} 
          />
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

          <Grid container>
            <div>
                <TextField
                value={form.severity_order || ''}
                label="Severity Order"
                type="number"
                onChange={e => setForm({ severity_order: e.target.value })}
                />
            </div>

            <div style={{ marginLeft: 10, flex: 1 }}>
                <TextField
                    fullWidth
                    required
                    error={!form.key}
                    value={form.key || ''}
                    label="Key"
                    onChange={e => setForm({ key: e.target.value })}
                />
            </div>
          </Grid>
          <br /><br />

          <div>
            <TextField
              fullWidth
              value={form.description || ''}
              label="Description"
              onChange={e => setForm({ description: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              value={form.expression || ''}
              label="Diagnosis expression (e.g. $Temp > 37 or $Gestation < 20)"
              onChange={e => setForm({ expression: e.target.value })}
            />
          </div>
          <br /><br />

          <div>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={form.expressionMeaning || ''}
              label="Expression explanation (e.g. Temperature greater than 37 degrees or Gestation period less than 20 weeks)"
              onChange={e => setForm({ expressionMeaning: e.target.value })}
            />
          </div>
          <br /><br />

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
        </CardContent>

        <CardActions style={{ justifyContent: 'flex-end' }}>
          {viewMode === 'view' && <Typography color="error" variant="caption">Can't save because you're in view mode</Typography>}

          <Button
            color="primary"
            onClick={() => saveDiagnosis()}
            disabled={(viewMode === 'view') || !canSaveDiagnosis()}
          >Save</Button>
        </CardActions>
      </Card>

      <br /><br />

      <Symptoms
        form={form}
        setForm={setForm}
        diagnosis={diagnosis}
        script={script}
      />

      {savingDiagnosis && <OverlayLoader transparent />}
    </>
  );
}

DiagnosisEditor.propTypes = {
  diagnosis: PropTypes.object,
  script: PropTypes.object,
};

export default DiagnosisEditor;
