import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class FileInput extends React.Component {
  render() {
    const {
      children,
      className,
      style,
      id,
      ...props
    } = this.props;
    return (
      <div
        id={id}
        style={style}
        className={cx(className, 'ui__fileInput')}
      >
        {children}
        <input {...props} type="file" />
      </div>
    );
  }
}

FileInput.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default FileInput;
