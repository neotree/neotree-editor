import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class Wrapper extends React.Component {
  componentDidMount() {
    if (this.docBody) this.docBody.classList.add('ui__body');
  }

  componentWillUnmount() {
    if (this.docBody) this.docBody.classList.remove('ui__body');
  }

  docBody = global.document.body;

  render() {
    const { className, children, ...props } = this.props;

    return (
      <div
        {...props}
        className={cx(className, 'ui__wrapper')}
      >
        {children}
      </div>
    );
  }
}

Wrapper.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default Wrapper;
