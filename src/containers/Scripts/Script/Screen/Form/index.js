import React from 'react';
import { useScreenContext } from '@/contexts/screen';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import ScreenType from './ScreenType';
import FlowControl from './FlowControl';
import Properties from './Properties';

function ScreenEditor() {
  const {
    canSaveScreen,
    saveScreen,
    state: { form },
  } = useScreenContext();

  return (
    <>
      <Card>
        <CardContent>
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
    </>
  );
}

export default ScreenEditor;
