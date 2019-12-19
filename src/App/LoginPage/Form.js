import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import { Button, Textfield } from 'react-mdl';
import copy from 'copy/authenticationCopy';
import reduxComponent from 'reduxComponent';
import emailRegex from 'emailRegex';
import Logo from 'Logo';
import FormButtonBar from 'FormButtonBar';
import cx from 'classnames';
import Api from 'AppUtils/Api';
import Typography from '@material-ui/core/Typography';

const Form = ({
  style,
  actions,
  roles,
  authenticatedUser
}) => {
  const [authAction, setAuthAction] = useState('sign-in');

  const actionCopy = authAction === 'sign-up' ? copy.SIGN_UP : copy.SIGN_IN;

  const [form, _setForm] = useState({
    username: '',
    password: '',
    password2: ''
  });

  const setForm = v => _setForm({ ...form, ...v });

  const [usernameIsRegistered, setAcountIsRegistered] = useState(null);

  const [loading, setLoading] = useState(false);

  const [formError, setFormError] = useState(null);
  const [authenticateError, setAuthenticateError] = useState(null);

  const redirectAuthenticated = () => (global.window.location.href = '/dashboard');

  const { username, password, password2 } = form;

  const onChange = e => {
    setFormError(null);
    setAuthenticateError(null);
    setForm({ [e.target.name]: e.target.value });
  };

  const canAuthenticate = cb => {
    let error = null;
    const password2Required = authAction === 'sign-up';

    if (!(username && password) && (password2Required ? !password2 : true)) {
      error = {};
      const setMissingFieldError = key => (error[key] = 'Required field.');
      if (!username) setMissingFieldError('username');
      if (!password) setMissingFieldError('password');
      if (!(password2 && (authAction === 'sign-up'))) setMissingFieldError('password2');
    } else {
      if ((authAction === 'sign-up') && (password !== password2)) {
        error = {
          password: 'Passwords should match.',
          password2: 'Passwords should match.'
        };
      }

      if (!emailRegex.test(username)) {
        error = { username: 'Invalid email address format.' };
      }
    }

    if (cb) cb(error);
    return error ? false : true;
  };

  const authenticate = () => {
    if (!canAuthenticate(error => setFormError(error))) return;

    setLoading(true);

    actions.post(authAction, {
      ...form,
      ...(roles ? { roles } : {}),
      onResponse: () => setLoading(false),
      onSuccess: ({ payload }) => {
        actions.$updateApp({ authenticatedUser: payload.user });
        redirectAuthenticated();
      },
      onFailure: authenticateError => setAuthenticateError(authenticateError)
    });
  };

  const onKeyUp = e => {
    if (e && (e.type === 'keyup') && (e.keyCode !== 13)) return;
    authenticate();
  };

  useEffect(() => {
    global.document.addEventListener('keyup', onKeyUp, true);

    return global.document.removeEventListener('keyup', onKeyUp, true);
  });

  useEffect(() => {
    if (authenticatedUser) redirectAuthenticated();
  }, [authenticatedUser]);

  return (
    <>
      <div
        className={cx('authenticationForm ui__shadow')}
        style={{
          ...style,
          background: '#fff',
          width: '90%',
          maxWidth: '300px',
          padding: '10px'
        }}
      >
        <div className={cx('ui__flex ui__flex_column ui__alignItems_center')}>
          <Logo />
          <br />
          <h4 className={cx('ui__compact')}>{actionCopy.TITLE}</h4>
        </div>

        <>
          <br />

          <Textfield
            style={{ width: '100%' }}
            floatingLabel
            name="username"
            label={`${copy.USERNAME} *`}
            value={username}
            onChange={onChange}
            error={formError && formError.username ? formError.username : ''}
          />

          {usernameIsRegistered ? null : (
            <>
              {formError && formError.lookup_username ?
                <Typography color="error" variant="caption">
                  {formError.lookup_username.msg ||
                    formError.lookup_username.message || JSON.stringify(formError.lookup_username)}
                </Typography> : null}
              <FormButtonBar>
                  <Button
                    disabled={loading || !username}
                    onClick={() => {
                      setLoading(true);
                      Api.post('/lookup-username', { username })
                        .then(({ payload: { usernameIsRegistered, userIsActive } }) => {
                          setLoading(false);
                          if (usernameIsRegistered) {
                            setAcountIsRegistered(true);
                            if (!userIsActive) setAuthAction('sign-up');
                          } else {
                            setAuthAction('sign-in');
                            setFormError({ username: 'Username is not registered' });
                          }
                        })
                        .catch(error => {
                          setLoading(false);
                          setFormError({ lookup_username: error });
                        });
                    }}
                    raised
                    accent
                    ripple
                    disabled={loading}
                  >
                    Next
                  </Button>
              </FormButtonBar>
            </>
          )}
        </>

        {!usernameIsRegistered ? null : <>
          <br />

          <Textfield
            style={{ width: '100%' }}
            floatingLabel
            type="password"
            name="password"
            label={`${copy.PASSWORD} *`}
            value={password}
            onChange={onChange}
            error={formError && formError.password ? formError.password : ''}
          />

          <br />

          {authAction !== 'sign-in' ?
            <div>
              <Textfield
                style={{ width: '100%' }}
                floatingLabel
                type="password"
                name="password2"
                label={`${copy.CONFIRM_PASSWORD} *`}
                value={password2}
                onChange={onChange}
                error={formError && formError.password2 ? formError.password2 : ''}
              />

              <br />
            </div> : null}

          <div className={cx('ui__flex ui__alignItems_center')}>
            {authenticateError ?
              <div style={{ overflow: 'hidden' }}>
                <p
                  className={cx('ui__dangerColor ui__superSmallFontSize', {
                    'ui__ellipsis ui__compact ui__textAlign_right': true
                  })}
                >
                  {authenticateError.msg || authenticateError.message || JSON.stringify(authenticateError)}
                </p>
              </div> : null}&nbsp;

            <div style={{ marginLeft: 'auto' }}>
              <FormButtonBar>
                  <Button
                    onClick={authenticate}
                    raised
                    accent
                    ripple
                    disabled={loading}
                  >
                    {actionCopy.TITLE}
                  </Button>
              </FormButtonBar>
            </div>
          </div>
        </>}
      </div>
    </>
  );
};

export default hot(withRouter(
  reduxComponent(Form, state => ({
    copy: (state.apiData.copy || {}).authentication || copy,
    authenticatedUser: state.$APP.authenticatedUser
  }))
));
