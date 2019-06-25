import React from 'react';
import PropTypes from 'prop-types';
import { FiUser, FiCamera } from 'react-icons/fi';
import cx from 'classnames';
import './index.scss';

export class Avatar extends React.Component {
  render() {
    const { className, size, onEdit, src, ...props } = this.props;
    return (
      <div
        {...props}
        className={cx(className, 'ui__avatar', {
          'uiBg__faintGreyColor uiBorder__lightGreyColor ui__lightGreyColor': true,
          editable: onEdit
        })}
        style={{
          ...(props.style || {}),
          width: `${size || 50}px`,
          height: `${size || 50}px`,
          fontSize: `${(size || 50) - 5}px`,
        }}
      >
        {src ?
          <img src={src} role="presentation" />
          :
          <FiUser />}

        {onEdit ?
          <div
            className={cx('ui__avatarEditor')}
            onClick={onEdit}
          >
            <FiCamera />
          </div>
          :
          null}
      </div>
    );
  }
}

Avatar.propTypes = {
  src: PropTypes.string,
  onEdit: PropTypes.func,
  size: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string
};

export default Avatar;
