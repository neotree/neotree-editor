import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import Item from './_Item';

const useStyles = makeStyles(() => ({
  root: {},
}));

const HeaderItem = React.forwardRef(({
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

HeaderItem.propTypes = {
  className: PropTypes.string,
};

export default HeaderItem;
