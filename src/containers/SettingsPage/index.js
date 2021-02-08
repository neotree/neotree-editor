import React from 'react';
import copy from '@/constants/copy/settings';
import { setDocumentTitle, setNavSection } from '@/AppContext';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ApiKey from './ApiKey';
// import ExportToFirebase from './ExportToFirebase';
// import ImportFromFirebase from './ImportFromFirebase';

const SettingsPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setNavSection('settings');

  return (
    <>
      <div>
        <Card>
          <CardContent>
            {/*<ExportToFirebase />*/}

            {/*<br />*/}

            {/*<ImportFromFirebase />*/}

            {/*<br /> <br />*/}

            <ApiKey />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
