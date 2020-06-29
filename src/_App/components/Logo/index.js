import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';

const Logo = () => {
  return (
    <h2 className="ui__compact">Neo Tree</h2>
  );
};

Logo.propTypes = {
  className: PropTypes.string
};

export default hot(Logo);
