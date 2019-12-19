import React from 'react';
import { hot } from 'react-hot-loader/root';
import cx from 'classnames';
import Container from 'AppComponents/Container';
import Form from './Form';

export class LoginPage extends React.Component {
  render() {
    return (
      <Container>
        {({ windowHeight }) => (
          <div
            className={cx('ui__flex')}
            style={{
              height: windowHeight,
              width: '100%',
              left: 0,
              right: 0,
              position: 'fixed',
              overflowY: 'auto',
              padding: '25px 0',
              boxSizing: 'border-box'
            }}
          >
            <Form
              {...this.props}
              authAction="sign-in"
              style={{ margin: 'auto' }}
            />
          </div>
        )}
      </Container>
    );
  }
}

export default hot(LoginPage);
