import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import Item from './_Item';

const useStyles = makeStyles(() => ({
  root: {},
}));

const SidebarItem = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const classes = useStyles();

  return (
    <>
      <Item
        ref={ref}
        className={cx(className, classes.root)}
        {...props}
      />
    </>
  );
});

SidebarItem.propTypes = {
  className: PropTypes.string,
};

export default SidebarItem;
