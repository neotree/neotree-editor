/* global fetch, alert, window */
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import TitleTextImageForm from '@/components/TitleTextImageForm';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';
import UploadFilesPrompt from '@/components/UploadFilesPrompt';
import OverlayLoader from '@/components/OverlayLoader';
import Symptoms from './Symptoms';

function DiagnosisEditor({ diagnosis, script }) {
  const history = useHistory();
  const { scriptId } = useParams();

  const [form, _setForm] = React.useState({
    description: null,
    expression: null,
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
              label="Diagnosis expression"
              onChange={e => setForm({ expression: e.target.value })}
            />
          </div>
          <br /><br />

          {!diagnosis ? null : (
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
          )}
        </CardContent>

        <CardActions style={{ justifyContent: 'flex-end' }}>
          <Button
            color="primary"
            onClick={() => saveDiagnosis()}
            disabled={!canSaveDiagnosis()}
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
