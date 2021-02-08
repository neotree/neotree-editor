import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Popper from '@material-ui/core/Popper';
import Avatar from '@material-ui/core/Avatar';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import { useAppContext } from '@/AppContext';
import AvatarForm from '@/components/AvatarForm';
import SignOut from '@/components/SignOut';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    width: 250,
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
  },
  signOutBox: {
    textAlign: 'center',
  },
  signOutBtn: {
    display: 'inline-block',
    borderRadius: 20,
    width: '80%',
  },
}));

const UserMenu = () => {
  const { state: { authenticatedUser } } = useAppContext();

  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClick = e => {
    setAnchorEl(e.currentTarget);
    setOpen(open => !open);
  };

  const { email } = authenticatedUser;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
      >
        <Avatar />
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper className={cx(classes.paper)}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div>
                  <div className={cx(classes.userName)}>
                    <AvatarForm />
                    <div style={{ paddingLeft: 10, }}>
                      <Typography
                        style={{ lineHeight: 'normal' }}
                      >{email}</Typography>
                    </div>
                  </div>

                  <br />

                  <div className={cx(classes.signOutBox)}>
                    <SignOut
                      className={cx(classes.signOutBtn)}
                      variant="outlined"
                      size="small"
                      Component={Button}
                    />
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default UserMenu;
