import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FiMenu } from 'react-icons/fi';
import './index.scss';

const Title = ({ title, withLayoutSidebar, className }) => {
  return (
    <div
      className={cx(className, 'ui__layoutTitleWrap', {
        'ui__flex ui__alignItems_baseline': true
      })}
    >
      {withLayoutSidebar ? (
        <div className={cx('ui__layoutMenuBtn')}>
          <FiMenu />
        </div>
      ) : null}

      <div className={cx('ui__layoutTitle')}>
        {title}
      </div>
    </div>
  );
};

Title.propTypes = {
  className: PropTypes.string,
  withLayoutSidebar: PropTypes.bool,
  title: PropTypes.node
};

export default Title;
