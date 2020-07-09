import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Paper from '@material-ui/core/Paper';
import makeStyles from '../utils/makeStyles';
import LayoutItem from '../LayoutItem';

const useStyles = makeStyles(() => ({
  root: {
    position: 'fixed',
    height: '100%',
    overflowY: 'auto',
    transition: 'left .3s',
    boxSizing: 'border-box',
  },
  rootDimensions: ({ _layout, hasHeader }) => {
    const isDesktop = _layout.viewport === 'desktop';
    const display = _layout.DISPLAY_DRAWER || isDesktop;
    return {
      top: hasHeader && isDesktop ? _layout.HEADER_HEIGHT : 0,
      left: 0,
      width: _layout.DRAWER_WIDTH,
      zIndex: isDesktop ? _layout.HEADER_ZINDEX - 1 : _layout.HEADER_ZINDEX + 2,
      ...display ? null : {
        left: -_layout.DRAWER_WIDTH,
      },
    };
  },
  overlay: ({ _layout }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: _layout.HEADER_ZINDEX + 1,
    background: 'rgba(0,0,0,.4)',
    display: _layout.DISPLAY_DRAWER && _layout.viewport !== 'desktop' ? 'block' : 'none',
  }),
}));

export default function LayoutDrawer({
  hasHeader,
  className,
  ...props
}) {
  const classes = useStyles({ hasHeader });

  return (
    <>
      <LayoutItem>{({ setState }) => {
        return (
          <>
            <Paper
              {...props}
              square
              elevation={3}
              className={cx(
                className,
                classes.root,
                classes.rootDimensions,
              )}
            />

            <div
              className={cx(classes.overlay)}
              onClick={() => setState({ DISPLAY_DRAWER: false })}
            />
          </>
        );
      }}</LayoutItem>
    </>
  );
}

LayoutDrawer.propTypes = {
  hasHeader: PropTypes.bool,
  className: PropTypes.string,
};
