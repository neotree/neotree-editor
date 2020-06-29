import React from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import WindowEventListener from '@/components/WindowEventListener';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
}));

const AuthForm = ({ copy, authType }) => {
  const classes = useStyles();

  const [loading, setLoading] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [usernameVerified, setUsernameVerified] = React.useState(false);

  const canSubmit = () => {
    let canSubmit = !loading && username;
    if (usernameVerified) {
      const passwordConfirmed = password && (authType === 'sign-up' ? password === password2 : true);
      canSubmit = canSubmit && passwordConfirmed;
    }
    return canSubmit;
  };

  const onVerifyEmailAddress = () => {
    if (!canSubmit()) return;
    setLoading(true);
    setTimeout(() => {
      setUsernameVerified(true);
      setLoading(false);
    }, 1000);
  };

  const onAuthenticate = () => {
    if (!canSubmit()) return;
  };

  const renderActions = actions => (
    <div className={cx(classes.actions)}>
      {actions}
    </div>
  );

  return (
    <>
      <WindowEventListener
        events={{
          keyup: () => {
            if (!usernameVerified) return onVerifyEmailAddress();
            onAuthenticate();
          },
        }}
      >
        <div>
          <TextField
            fullWidth
            variant="outlined"
            type="email"
            name="username"
            label={copy.EMAIL_ADDRESS_INPUT_LABEL}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <br />

        <Collapse in={!usernameVerified}>
          {renderActions(
            <>
              <Button
                variant="outlined"
                onClick={() => onVerifyEmailAddress()}
                disabled={!canSubmit()}
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
                label={copy.PASSWORD_INPUT_LABEL}
                onChange={e => setPassword(e.target.value)}
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
                    label={copy.PASSWORD_INPUT_LABEL}
                    onChange={e => setPassword2(e.target.value)}
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
                  disabled={!canSubmit()}
                >{copy.SUBMIT_BUTTON_LABEL}</Button>
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
