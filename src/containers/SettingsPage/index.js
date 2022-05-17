import React from 'react';
import copy from '@/constants/copy/settings';
import { setDocumentTitle, setNavSection } from '@/AppContext';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useAppContext } from '@/AppContext';
import makeApiCall from '@/api/makeApiCall';
import ApiKey from './ApiKey';
// import ExportToFirebase from './ExportToFirebase';
// import ImportFromFirebase from './ImportFromFirebase';

const SettingsPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setNavSection('settings');
  const { state: { appInfo: _appInfo }, setState: setAppState } = useAppContext();
  const [appInfo, setAppInfo] = React.useState({ 
    should_track_usage: false, 
    ..._appInfo 
  });

  React.useEffect(() => { setAppInfo(prev => ({ ...prev, ..._appInfo })); }, [_appInfo]);

  async function saveAppInfo(partialState) {
    setAppInfo(prev => ({ ...prev, ...partialState }));
    try {
      const updatedAppInfo = await makeApiCall('/update-app-info', { 
        method: 'POST', 
        body: { id: appInfo.id, ...partialState },
      });
      setAppState({ appInfo: updatedAppInfo });
    } catch(e) { /* */ }
  }

  return (
    <>
      <div>
        <Card>
          <CardContent>
            {/*<ExportToFirebase />*/}

            {/*<br />*/}

            {/*<ImportFromFirebase />*/}

            {/*<br /> <br />*/}
            
            <div>
              <FormControlLabel 
                label="Track app usage"
                control={(
                  <Checkbox 
                    checked={appInfo.should_track_usage}
                    onChange={() => saveAppInfo({ should_track_usage: !appInfo.should_track_usage })}
                  />
                )}
              />
            </div>

            <br />

            <ApiKey />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
