import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class Body extends React.Component {
  render() {
    const { className, children, ...props } = this.props;

    return (
      <div
        {...props}
        data-ui__layout-body
        data-ui__layout-item
        className={cx(className, 'ui__layoutBody')}
      >
        {children}
      </div>
    );
  }
}

Body.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default Body;
