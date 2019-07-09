import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import { Button, Textfield } from 'react-mdl';
import copy from 'copy/authenticationCopy'; // eslint-disable-line
import reduxComponent from 'reduxComponent';  // eslint-disable-line
import emailRegex from 'emailRegex';  // eslint-disable-line
import Logo from 'Logo';  // eslint-disable-line
import Container from 'ui/Container'; // eslint-disable-line
import FormButtonBar from 'FormButtonBar'; // eslint-disable-line
import cx from 'classnames';

export class Form extends Component {
  state = {
    error: null,
    form: {
      username: '',
      password: '',
      password2: ''
    }
  };

  componentWillMount() {
    if (this.props.authenticatedUser) this.redirectAuthenticated();
  }

  componentDidMount() {
    global.document.addEventListener('keyup', this.onKeyUp, true);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.authenticatedUser) this.redirectAuthenticated();
  }

  componentWillUnmount() {
    global.document.removeEventListener('keyup', this.onKeyUp, true);
  }

  onKeyUp = e => {
    if (e && (e.type === 'keyup') && (e.keyCode !== 13)) return;
    this.authenticate();
  };

  onChange = e => {
    const newState = {};
    newState[e.target.name] = e.target.value;
    this.setState({
      error: null,
      authenticateError: null,
      form: { ...this.state.form, ...newState }
    });
  };

  canAuthenticate = cb => {
    const { username, password, password2 } = this.state.form;
    const { authAction } = this.props;
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

  authenticate = () => {
    if (!this.canAuthenticate(error => this.setState({ error }))) return;

    const { actions, authAction, roles } = this.props;
    const { form } = this.state;

    this.setState({ authenticating: true }, () => {
      actions.post(authAction, {
        ...form,
        ...(roles ? { roles } : {}),
        onResponse: () => this.setState({ authenticating: false }),
        onSuccess: ({ payload }) => {
          actions.$updateApp({ authenticatedUser: payload.user });
          this.redirectAuthenticated();
        },
        onFailure: authenticateError => this.setState({ authenticateError })
      });
    });
  };

  redirectAuthenticated = () => (global.window.location.href = '/dashboard');

  render() {
    const { copy, authAction, style } = this.props;
    const actionCopy = authAction === 'sign-up' ? copy.SIGN_UP : copy.SIGN_IN;

    const { error, authenticateError, ...state } = this.state;
    const { username, password, password2 } = state.form;

    return (
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

        <br />

        <Textfield
          style={{ width: '100%' }}
          floatingLabel
          name="username"
          label={`${copy.USERNAME} *`}
          value={username}
          onChange={this.onChange}
          error={error && error.username ? error.username : ''}
        />

        <br />

        <Textfield
          style={{ width: '100%' }}
          floatingLabel
          type="password"
          name="password"
          label={`${copy.PASSWORD} *`}
          value={password}
          onChange={this.onChange}
          error={error && error.password ? error.password : ''}
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
              onChange={this.onChange}
              error={error && error.password2 ? error.password2 : ''}
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
                <Button onClick={this.authenticate} raised accent ripple>
                  {actionCopy.TITLE}
                </Button>
            </FormButtonBar>
          </div>
        </div>
      </div>
    );
  }
}

export default hot(withRouter(
  reduxComponent(Form, state => ({
    copy: (state.apiData.copy || {}).authentication || copy,
    authenticatedUser: state.$APP.authenticatedUser
  }))
));
