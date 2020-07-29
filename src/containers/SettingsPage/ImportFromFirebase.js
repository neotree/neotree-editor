import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import OverlayLoader from '@/components/OverlayLoader';
import getErrorMsg from '@/utils/getErrorMessage';
import * as api from '@/api/app';

export default function ImportFromFirebase() {
  const [loading, setLoading] = React.useState(false);
  const [msg, setMessage] = React.useState(null);

  return (
    <>
      <Typography variant="h6">Import firebase</Typography>

      <br />

      <Button
        color="primary"
        onClick={() => {
          setLoading(true);
          setMessage(null);
          api.importFirebase()
            .then(() => {
              alert('Firebase imported'); // eslint-disable-line
              // setMessage({ success: true, text: 'Firebase impored' });
              setLoading(false);
            })
            .catch(e => {
              alert(getErrorMsg(e)); // eslint-disable-line
              // setMessage({ success: false, text: getErrorMsg(e) });
              setLoading(false);
            });
        }}
      >Import firebase</Button>

      {/*!!msg && (
        <>
          <br />
          <Typography color={msg.success ? 'success' : 'error'}>{msg.text}</Typography>
        </>
      )*/}

      {loading && <OverlayLoader />}
    </>
  );
}
