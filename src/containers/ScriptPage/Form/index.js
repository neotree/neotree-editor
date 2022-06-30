/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory } from 'react-router-dom';
import Divider from '@/components/Divider';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';
import OverlayLoader from '@/components/OverlayLoader';
import { useAppContext } from '@/AppContext';
import { ImportScript } from '@/components/ImportScript';

function ScriptEditorForm({ script }) {
  const { state: { viewMode } } = useAppContext();
  const history = useHistory();

  const [form, _setForm] = React.useState({ ...script, exportable: true, });
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const [savingScript, setSavingScript] = React.useState(false);

  const canSaveScript = () => form.title && !savingScript;
  
  const saveScript = React.useCallback(() => {
    (async () => {
      setSavingScript(true);
      try {
        let res = await fetch(script ? '/update-script' : '/create-script', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(form),
        });
        res = await res.json();
        if (res.errors && res.errors.length) return alert(JSON.stringify(res.errors));
        if (script) {
          history.push('/scripts');
        } else {
          window.location.href = `/scripts/${res.script.script_id}`;
          // history.push(`/scripts/${res.script.script_id}`);
          // window.location.reload();
        }
      } catch (e) { alert(`Ooops... ${e.message}`); }
      setSavingScript(false);
    })();
  });

  return (
    <>
      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={10}>
              <TitleWithBackArrow backLink="/scripts" title={`${script ? 'Edit' : 'Add'} script`} />
            </Grid>
            <Grid item xs={2} style={{ textAlign: 'right' }}>
              {!!script && <ImportScript scriptId={script.script_id} />}
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

          <br />

          <div>
            <TextField
              fullWidth
              // required
              // error={!form.printTitle}
              value={form.printTitle || ''}
              label="Print title"
              onChange={e => setForm({ printTitle: e.target.value })}
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

          <br /><br />

          <Typography variant="button" color="primary">Type</Typography>
          <Divider color="primary" />
          <br />

          <RadioGroup 
            name="type" 
            value={form.type || ''} 
            onChange={e => {
              const type = e.target.value;
              setForm({ type });
            }}
          >
            {[
              { name: 'admission', label: 'Admission', },
              { name: 'discharge', label: 'Discharge', },
              { name: 'neolab', label: 'NeoLab', },
            ].map(t => (
              <FormControlLabel
                key={t.name}
                value={t.name}
                control={<Radio />}
                label={t.label}
              />
            ))}
          </RadioGroup>
          <br /><br />

          <FormControlLabel 
            control={<Checkbox />}
            value="exportable"
            label="Exportable"
            checked={form.exportable !== false}
            onChange={() => setForm({ exportable: !form.exportable, })}
          />
        </CardContent>

        <CardActions style={{ justifyContent: 'flex-end' }}>
          {viewMode === 'view' && <Typography color="error" variant="caption">Can't save because you're in view mode</Typography>}

          <Button
            color="primary"
            onClick={() => saveScript()}
            disabled={(viewMode === 'view') || !canSaveScript()}
          >Save</Button>
        </CardActions>
      </Card>

      {savingScript ? <OverlayLoader /> : null}
    </>
  );
}

ScriptEditorForm.propTypes = {
  script: PropTypes.object,
};

export default ScriptEditorForm;
