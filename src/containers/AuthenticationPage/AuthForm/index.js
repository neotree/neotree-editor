import React from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import WindowEventListener from '@/components/WindowEventListener';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';
import useFormState from './useFormState';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
}));

const AuthForm = ({ copy, authType }) => {
  const classes = useStyles();

  const {
    setForm,
    disableAction,
    onAuthenticate,
    checkEmailRegistration,
    state: {
      loading,
      usernameVerified,
      form: {
        username,
        password,
        password2,
      },
    }
  } = useFormState(authType);

  const renderActions = actions => (
    <div className={cx(classes.actions)}>
      {actions}
    </div>
  );

  const renderBtnText = text => (
    <>
      <Typography color="inherit" variant="caption">{text}</Typography>
      {loading ? <>&nbsp;&nbsp;<CircularProgress size={15} /></> : null}
    </>
  );

  return (
    <>
      <WindowEventListener
        events={{
          keyup: () => {
            if (!usernameVerified) return checkEmailRegistration(authType);
            onAuthenticate(authType);
          },
        }}
      >
        <div>
          <TextField
            fullWidth
            variant="outlined"
            type="email"
            name="username"
            value={username || ''}
            label={copy.EMAIL_ADDRESS_INPUT_LABEL}
            onChange={e => setForm({ username: e.target.value })}
          />
        </div>

        <br />

        <Collapse in={!usernameVerified}>
          {renderActions(
            <>
              <Button
                variant="outlined"
                onClick={() => checkEmailRegistration(authType)}
                disabled={disableAction(authType)}
              >{copy.VERIFY_EMAIL_ADDRESS_BUTTON_TEXT}</Button>
            </>
          )}
        </Collapse>

        <Collapse in={usernameVerified}>
          <div>
            <div>
              <TextField
                fullWidth
                variant="outlined"
                type="password"
                name="password"
                value={password || ''}
                label={copy.PASSWORD_INPUT_LABEL}
                onChange={e => setForm({ password: e.target.value })}
              />
            </div>

            <br />

            {authType === 'sign-up' && (
              <>
                <br />

                <div>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="password"
                    name="password2"
                    value={password2 || ''}
                    label={copy.PASSWORD_INPUT_LABEL}
                    onChange={e => setForm({ password2: e.target.value })}
                  />
                </div>

                <br />
              </>
            )}

            {renderActions(
              <>
                <Button
                  variant="outlined"
                  onClick={() => onAuthenticate()}
                  disabled={disableAction()}
                >
                  {renderBtnText(copy.SUBMIT_BUTTON_LABEL)}
                </Button>
              </>
            )}
          </div>
        </Collapse>
      </WindowEventListener>
    </>
  );
};

AuthForm.propTypes = {
  copy: PropTypes.object.isRequired,
  authType: PropTypes.oneOf(['sign-in', 'sign-up']).isRequired,
};

export default AuthForm;
