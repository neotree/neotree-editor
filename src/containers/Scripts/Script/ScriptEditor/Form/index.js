import React from 'react';
import { useScriptContext } from '@/contexts/script';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

function ScriptEditor() {
  const {
    canSaveScript,
    setForm,
    saveScript,
    state: { form },
  } = useScriptContext();

  return (
    <>
      <Card>
        <CardContent>
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

        <CardActions>
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
