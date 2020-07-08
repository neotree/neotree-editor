import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import BackArrowIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';

export default function TitleWithBackArrow({ title }) {
  const history = useHistory();

  return (
    <>
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={1} sm={1}>
          <IconButton onClick={() => history.goBack()}>
            <BackArrowIcon />
          </IconButton>
        </Grid>
        <Grid item xs={11} sm={11}>
          <Typography variant="h5">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}

TitleWithBackArrow.propTypes = {
  title: PropTypes.node
};
