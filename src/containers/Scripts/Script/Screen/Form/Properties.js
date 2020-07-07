import React from 'react';
import { useScreenContext } from '@/contexts/screen';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Title from './Title';

function Properties() {
  const { setForm, state: { form }, } = useScreenContext();

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

      <br />

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
          required
          error={!form.printTitle}
          value={form.printTitle || ''}
          label="Print section title"
          onChange={e => setForm({ printTitle: e.target.value })}
        />
      </div>

      <br />

      <div>
        <TextField
          fullWidth
          value={form.actionText || ''}
          label="Action"
          onChange={e => setForm({ actionText: e.target.value })}
        />
      </div>

      <br />

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

      <br />

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

      <br />

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

      <br />
    </>
  );
}

export default Properties;
