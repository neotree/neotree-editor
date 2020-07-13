import React from 'react';
import { useScreenContext } from '@/contexts/screen';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import TitleWithBackArrow from '@/components/TitleWithBackArrow';
import UploadFilesPrompt from '@/components/UploadFilesPrompt';
import ScreenType from './ScreenType';
import FlowControl from './FlowControl';
import Properties from './Properties';
import MetadataItems from './Metadata/Items';
import MetadataFields from './Metadata/Fields';

function ScreenEditor() {
  const {
    canSaveScreen,
    saveScreen,
    setFormAndSave,
    state: { screen, form },
  } = useScreenContext();

  return (
    <>
      <UploadFilesPrompt 
        data={form.metadata}
        save={files => setFormAndSave(f => ({ metadata: { ...f.metadata, ...files } }))}
      />

      <Card>
        <CardContent>
          <TitleWithBackArrow 
            backLink={screen ? `/scripts/${screen.script_id}/screens` : null}
            title={`${screen ? 'Edit' : 'Add'} screen`} 
          />
          <br /><br />

          <ScreenType />

          <Collapse in={!!form.type}>
            <div>
              <FlowControl />
              <br />

              <Properties />
              <br />
            </div>
          </Collapse>
        </CardContent>

        {!!form.type && (
          <CardActions style={{ justifyContent: 'flex-end' }}>
            <Button
              color="primary"
              onClick={() => saveScreen()}
              disabled={!canSaveScreen()}
            >Save</Button>
          </CardActions>
        )}
      </Card>

      <br />

      {['single_select', 'multi_select', 'list', 'progress'].includes(form.type) && (
        <>
          <MetadataItems />
        </>
      )}

      {form.type === 'form' && <MetadataFields />}
    </>
  );
}

export default ScreenEditor;
