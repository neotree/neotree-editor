import React from 'react';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import * as api from '@/api/app';

const ExportToFirebase = () => {
  const [exporting, setExporting] = React.useState(false);
  const [exportingError, setExportingError] = React.useState(false);

  const exportToFirebase = () => {
    setExporting(true);
    setExportingError(null);
    api.exportToFirebase('/export-to-firebase')
      .then(r => { setExporting(false); return r; })
      .then(rslts => console.log('RSLTS', rslts))
      .catch(setExportingError);
  };

  return (
    <>
      <Typography variant="h6">Export data</Typography>

      <br />

      {exporting ? <CircularProgress size={20} /> : (
        <>
          <Button
            color="primary"
            onClick={() => exportToFirebase()}
          >
            Export to firebase
          </Button>
        </>
      )}

      <br />
    </>
  );
};

export default ExportToFirebase;
