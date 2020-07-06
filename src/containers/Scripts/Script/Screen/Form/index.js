import React from 'react';
import { useScreenContext } from '@/contexts/screen';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

function ScreenEditor() {
  const {
    canSaveScreen,
    setForm,
    saveScreen,
    state: { form },
  } = useScreenContext();

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
              value={form.descreenion || ''}
              label="Descreenion"
              onChange={e => setForm({ descreenion: e.target.value })}
            />
          </div>
        </CardContent>

        <CardActions>
          <Button
            color="primary"
            onClick={() => saveScreen()}
            disabled={!canSaveScreen()}
          >Save</Button>
        </CardActions>
      </Card>
    </>
  );
}

export default ScreenEditor;
