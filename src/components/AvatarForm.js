import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';

const useStyles = makeStyles(theme => ({
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
  }
}));

const AvatarForm = ({ avatar }) => {
  const classes = useStyles();

  return (
    <>
      <div>
        <Avatar
          className={cx(classes.avatar)}
          src={avatar ? avatar.url : null}
        />
      </div>
    </>
  );
};

AvatarForm.propTypes = {
  avatar: PropTypes.object,
};

export default AvatarForm;
