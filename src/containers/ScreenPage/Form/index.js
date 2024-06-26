/* global fetch, alert, window */
import React from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';
import UploadFilesPrompt from '@/components/UploadFilesPrompt';
import OverlayLoader from '@/components/OverlayLoader';
import { useAppContext } from '@/AppContext';
import { FieldConfig } from '@/components/FieldConfig';
import { PrintConfig } from '@/components/PrintConfig';
import ScreenType from './ScreenType';
import FlowControl from './FlowControl';
import Properties from './Properties';
import MetadataItems from './Metadata/Items';
import MetadataFields from './Metadata/Fields';
import EdlizSummaryTable from './EdlizSummaryTable';

const defaultForm = {
    metadata: { 
        items: [], 
        fields: [], 
    },
    printable: true,
    printCategory: null,
};

function ScreenEditor({ screen, script, canAddDiagnosisScreen }) {
  const { state: { viewMode } } = useAppContext();
  const history = useHistory();
  const { scriptId } = useParams();

  const [form, _setForm] = React.useState({
    ...defaultForm,
    scriptId,
    ...screen,
    metadata: {
        ...defaultForm.metadata,
        ...(screen ? screen.metadata : {}),
    },
  });
  const setForm = s => _setForm(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const [savingScreen, setSavingScreen] = React.useState(false);

  const canSaveScreen = () => form.title && !savingScreen;

  const saveScreen = React.useCallback((opts = {}) => {
    const { redirectOnSuccess, form: _form } = opts;
    (async () => {
      setSavingScreen(true);
      try {
        let res = await fetch(screen ? '/update-screen' : '/create-screen', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ ...form, ..._form }),
        });
        res = await res.json();
        if (res.errors && res.errors.length) return alert(JSON.stringify(res.errors));
        if (redirectOnSuccess !== false) history.push(`/scripts/${scriptId}/screens`);
      } catch (e) { alert(e.message); }
      setSavingScreen(false);
    })();
  });

  return (
    <>
      <UploadFilesPrompt 
        data={form.metadata}
        save={files => {
          const _form = { ...form, metadata: { ...form.metadata, ...files } };
          setForm(_form);
          saveScreen({ redirectOnSuccess: false, form: _form });
        }}
      />

      <Card>
        <CardContent>
          <TitleWithBackArrow 
            backLink={screen ? `/scripts/${screen.scriptId}/screens` : null}
            title={`${screen ? 'Edit' : 'Add'} screen`} 
          />
          <br /><br />

          {form.type === 'management' && (
            <>
              <Grid alignItems="baseline">
                <TextField 
                    label="Reference Key"
                    placeholder="$refKey"
                    value={form.refKey}
                    onChange={e => setForm({ refKey: e.target.value })}
                />

                &nbsp;&nbsp;

                <FormControlLabel
                  checked={form.printable}
                  label="Print"
                  control={<Checkbox />}
                  onChange={(e) => setForm({ printable: !form.printable })}
                />
              </Grid>

              <br /><br />
            </>
          )}

          <ScreenType 
            form={form} 
            setForm={setForm} 
            screen={screen} 
            script={script} 
            canAddDiagnosisScreen={canAddDiagnosisScreen}
          />

          <Collapse in={!!form.type}>
            <div>
              <FlowControl form={form} setForm={setForm} screen={screen} script={script} />
              <br />

              <Properties form={form} setForm={setForm} screen={screen} script={script} />
              <br />

			  {!['form', 'edliz_summary_table', 'zw_edliz_summary_table', 'mwi_edliz_summary_table', 'diagnosis', 'management'].includes(form.type) && (
					<>
						<FieldConfig 
							value={form.prePopulate || []}
							onChange={prePopulate => setForm({ prePopulate })}
						/>
						<br />
					</>
				)}

                {['yesno', 'timer', 'single_select', 'multi_select', 'checklist', 'zw_edliz_summary_table', 'mwi_edliz_summary_table', 'diagnosis'].includes(form.type) && (
                    <>
                        <PrintConfig 
                            data={{
                                printable: form.printable,
                                printCategory: form.printCategory,
                            }}
                            onChange={data => setForm({ ...data })}
                        />
                        <br />
                    </>
                )}
            </div>
          </Collapse>
        </CardContent>

        {!!form.type && (
          <CardActions style={{ justifyContent: 'flex-end' }}>
            {viewMode === 'view' && <Typography color="error" variant="caption">Can't save because you're in view mode</Typography>}

            <Button
              color="primary"
              onClick={() => saveScreen()}
              disabled={(viewMode === 'view') || !canSaveScreen()}
            >Save</Button>
          </CardActions>
        )}
      </Card>

      <br />

      {['single_select', 'multi_select', 'list', 'progress', 'checklist', 'diagnosis'].includes(form.type) && (
        <>
          <MetadataItems form={form} setForm={setForm} screen={screen} script={script} />
        </>
      )}

      {['form'].includes(form.type) && <MetadataFields form={form} setForm={setForm} screen={screen} script={script} />}

      {['edliz_summary_table', 'zw_edliz_summary_table', 'mwi_edliz_summary_table'].includes(form.type) && <EdlizSummaryTable form={form} setForm={setForm} screen={screen} script={script} />}

      {savingScreen && <OverlayLoader transparent />}
    </>
  );
}

ScreenEditor.propTypes = {
  screen: PropTypes.object,
  script: PropTypes.object,
  canAddDiagnosisScreen: PropTypes.bool.isRequired,
};

export default ScreenEditor;
