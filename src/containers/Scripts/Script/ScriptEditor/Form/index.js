import React from 'react';
import { useScriptContext } from '@/contexts/script';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';

function ScriptEditor() {
  const {
    canSaveScript,
    setForm,
    saveScript,
    state: { script, form },
  } = useScriptContext();

  return (
    <>
      <Card>
        <CardContent>
          <TitleWithBackArrow title={`${script ? 'Edit' : 'Add'} script`} />
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

          <br />

          <div>
            <TextField
              fullWidth
              value={form.description || ''}
              label="Description"
              onChange={e => setForm({ description: e.target.value })}
            />
          </div>
        </CardContent>

        <CardActions style={{ justifyContent: 'flex-end' }}>
          <Button
            color="primary"
            onClick={() => saveScript()}
            disabled={!canSaveScript()}
          >Save</Button>
        </CardActions>
      </Card>
    </>
  );
}

export default ScriptEditor;
