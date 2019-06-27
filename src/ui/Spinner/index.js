import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

const Spinner = ({
  className,
  size,
  colorful,
  thickness,
  ...props
}) => {
  colorful = colorful !== false;
  size = size || 40;
  thickness = thickness || 5;

  return (
    <div
      {...props}
      className={cx(className, 'ui__spinner', { colorful })}
    >
      <div
        style={{
          width: size,
          height: size,
          display: 'inline-block'
        }}
      >
        <svg
          className='ui__spinnerIcon'
          style={{ width: size, height: size }}
          viewBox='0 0 66 66'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle
            r={30}
            cx={33}
            cy={33}
            fill='none'
            strokeWidth={thickness}
            strokeLinecap='round'
            className={cx('ui__spinnerIconPath', { colorful })}
          />
        </svg>
      </div>
    </div>
  );
};

Spinner.propTypes = {
  colorful: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
  thickness: PropTypes.number
};

export default Spinner;
