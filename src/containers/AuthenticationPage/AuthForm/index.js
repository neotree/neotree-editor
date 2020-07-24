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
  actionsWrap: { textAlign: 'right', },
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
      authenticateError,
      emailRegistration,
      form: {
        email,
        password,
        password2,
      },
    }
  } = useFormState(authType);

  const errors = emailRegistration.errors || authenticateError;

  const renderActions = actions => (
    <div className={cx(classes.actionsWrap)}>
      {!!errors && errors.map((e, i) => {
        const key = i;
        return (
          <div key={key}>
            <Typography color="error" variant="caption">{e}</Typography>
          </div>
        );
      })}
      <div className={cx(classes.actions)}>
        {actions}
      </div>
    </div>
  );

  const btnLoader = !loading ? null : <CircularProgress color="secondary" size={20} />;

  return (
    <>
      <WindowEventListener
        events={{
          keyup: e => {
            if (e.keyCode !== 13) return;
            if (!emailRegistration.userId) return checkEmailRegistration(authType);
            onAuthenticate(authType);
          },
        }}
      >
        <div>
          <TextField
            fullWidth
            variant="outlined"
            type="email"
            name="email"
            value={email || ''}
            label={copy.EMAIL_ADDRESS_INPUT_LABEL}
            onChange={e => setForm({ email: e.target.value })}
          />
        </div>

        <br />

        <Collapse in={!emailRegistration.userId}>
          {renderActions(
            <>
              <Button
                disableElevation
                size="large"
                color="primary"
                variant="contained"
                endIcon={btnLoader}
                onClick={() => checkEmailRegistration(authType)}
                disabled={disableAction(authType)}
              >{copy.VERIFY_EMAIL_ADDRESS_BUTTON_TEXT}</Button>
            </>
          )}
        </Collapse>

        <Collapse in={!!emailRegistration.userId}>
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
                  disableElevation
                  size="large"
                  color="primary"
                  variant="contained"
                  endIcon={btnLoader}
                  onClick={() => onAuthenticate()}
                  disabled={disableAction(authType)}
                >
                  {copy.SUBMIT_BUTTON_LABEL}
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
