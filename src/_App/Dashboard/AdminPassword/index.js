import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; 
import Form from './Form';

export class AdminPassword extends React.Component {
  render() { console.log('AdminPassword');
    return (<Form {...this.props} />);
  }
}

AdminPassword.propTypes = {
  actions: PropTypes.object
};

export default hot(withRouter(
  reduxComponent(AdminPassword)
));
