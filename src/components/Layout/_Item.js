import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import { usePageContext } from './PageContext';

const useStyles = makeStyles(theme => ({
  root: {},
  padded: {
    padding: theme.spacing(),
  }
}));

const Item = React.forwardRef(({
  className,
  component: c,
  padded,
  onClick,
  ...props
}, ref) => {
  const classes = useStyles();
  const Component = c || 'div';

  const { setState, state: { screenType, sidebarIsVisible } } = usePageContext();

  return (
    <>
      <Component
        {...props}
        ref={ref}
        className={cx(className, classes.root, {
          [classes.padded]: padded !== false,
        })}
        onClick={e => {
          if (sidebarIsVisible && (screenType !== 'desktop')) setState({ sidebarIsVisible: false });
          if (onClick) onClick(e);
        }}
      />
    </>
  );
});

Item.propTypes = {
  onClick: PropTypes.func,
  padded: PropTypes.bool,
  className: PropTypes.string,
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.object,
  ])
};

export default Item;
