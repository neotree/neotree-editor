import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import cx from 'classnames';
import reduxComponent from 'reduxComponent';
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
            <Form {...this.props} style={{ margin: 'auto' }} />
          </div>
        )}
      </Container>
    );
  }
}

LoginPage.propTypes = {
  authAction: PropTypes.oneOf(['sign-in', 'sign-up']).isRequired
};

export default hot(
  reduxComponent(LoginPage, (state, ownProps) => {
    return {
      authAction: ownProps.authAction || ownProps.match.params.authAction
    };
  })
);
