import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';

const useStyles = makeStyles(theme => ({
  root: {

  },
  smallBodyWidth: {
    width: '90%',
    maxWidth: theme.breakpoints.values.xs,
    margin: '0 auto',
  },
  fullBodyWidth: {
    width: '100%',
  },
  defaultBodyWidth: {
    width: '90%',
    maxWidth: theme.breakpoints.values.md,
    margin: '0 auto',
  },
}));

const Body = ({ children, body: _body }) => {
  const body = {
    width: 'default',
    marginTop: 25,
    marginBottom: 25,
    ..._body,
  };

  const classes = useStyles();

  return (
    <>
      <div
        style={{ marginTop: body.marginTop, marginBottom: body.marginBottom, }}
        className={cx(classes.root, classes[`${body.width}BodyWidth`])}
      >
        {children}
      </div>
    </>
  );
};

Body.propTypes = {
  body: PropTypes.shape({
    width: PropTypes.oneOf(['small', 'default', 'full']),
    marginTop: PropTypes.number,
    marginBottom: PropTypes.number,
  }),
  children: PropTypes.node,
};

export default Body;
