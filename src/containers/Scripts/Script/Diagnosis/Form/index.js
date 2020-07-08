import React from 'react';
import { useDiagnosisContext } from '@/contexts/diagnosis';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import TitleTextImageForm from '@/components/TitleTextImageForm';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';
import Symptoms from './Symptoms';

function DiagnosisEditor() {
  const {
    canSaveDiagnosis,
    saveDiagnosis,
    setForm,
    state: { diagnosis, form },
  } = useDiagnosisContext();

  return (
    <>
      <Card>
        <CardContent>
          <TitleWithBackArrow title={`${diagnosis ? 'Edit' : 'Add'} diagnosis`} />
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

      <Symptoms />
    </>
  );
}

export default DiagnosisEditor;
