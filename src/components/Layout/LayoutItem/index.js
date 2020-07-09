import React from 'react';
import PropTypes from 'prop-types';
import { useLayoutContext } from '../Context';

export default function LayoutItem({ children }) {
  const ctx = useLayoutContext();

  return (
    <>
      {typeof children === 'function' ? children(ctx) : children}
    </>
  );
}

LayoutItem.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
};
