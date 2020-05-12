/* global document */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CopyIcon from '@material-ui/icons/FilterNoneRounded';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Api from 'AppUtils/Api';

const ApiKey = () => {
  const inputRef = React.useRef(null);

  const [initialised, setInitialised] = React.useState(false);
  const [initError, setInitErrror] = React.useState(null);
  const [keyGenError, setKeyGenError] = React.useState(null);
  const [openConfirmKeyGenModal, setOpenConfirmKeyGenModal] = React.useState(false);
  const [generatingKey, setGeneratingKey] = React.useState(false);

  const [apiKey, setApiKey] = React.useState('');

  React.useEffect(() => {
    Api.get('/api/key')
      .then(({ payload: { apiKey } }) => {
        setInitialised(true);
        setApiKey(apiKey || '');
      })
      .catch(err => {
        setInitialised(true);
        setInitErrror(err);
      });
  }, []);

  const generateKey = () => {
    setGeneratingKey(true);

    Api.post('/api/generate-key', { apiKey })
      .then(({ payload: { apiKey } }) => {
        setGeneratingKey(false);
        setApiKey(apiKey);
      })
      .catch(err => {
        setGeneratingKey(false);
        setKeyGenError(err);
      });
  };

  return (
    <>
      <Typography variant="h5">Api keys</Typography>

      <br />

      {!initialised ? <CircularProgress size={20} /> : (
        <>
          {initError ?
            <Typography color="error">
              {initError.msg || initError.message || JSON.stringify(initError)}
            </Typography>
            :
            (
              <>
                <Grid container spacing={2} alignItems='center'>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      inputRef={inputRef}
                      value={apiKey ? apiKey.key : ''}
                      disabled={!apiKey || generatingKey}
                      placeholder='API KEY'
                      fullWidth
                      onChange={() => { /*Do nothing*/ }}
                      onFocus={e => {
                        e.target.select();
                        document.execCommand('copy');
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    {!apiKey ? null : (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => inputRef.current.focus()}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>&nbsp;&nbsp;

                        <a
                          href="/api/download-api-config"
                          target="__blank"
                          style={{ textDecoration: 'none', outline: 'none !important' }}
                        >
                          <Button
                            size="small"
                            color="primary"
                          >
                            Download api config file
                          </Button>
                        </a>&nbsp;&nbsp;
                      </>
                    )}

                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={generatingKey}
                      onClick={() => {
                        setKeyGenError(null);

                        if (apiKey) {
                          setOpenConfirmKeyGenModal(true);
                          return;
                        }

                        generateKey();
                      }}
                    >Genarate Api Key</Button>
                  </Grid>

                  {!keyGenError ? null : (
                    <Typography color="error" variant="caption">
                      {keyGenError.msg || keyGenError.message || JSON.stringify(keyGenError)}
                    </Typography>
                  )}
                </Grid>
              </>
            )}
        </>
      )}

      <Dialog
        open={openConfirmKeyGenModal}
        onClose={() => setOpenConfirmKeyGenModal(false)}
      >
        <DialogContent>
          <Typography>Are you sure you want to change the existing api key?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenConfirmKeyGenModal(false);
            }}
          >No</Button>
          <Button
            color="primary"
            onClick={() => {
              generateKey();
              setOpenConfirmKeyGenModal(false);
            }}
          >Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApiKey;
