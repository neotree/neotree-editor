import React from 'react';
import Divider from '@/components/Divider';
import Typography from '@material-ui/core/Typography';

function Title(props) {
  return (
    <>
      <Typography variant="button" color="primary" {...props} />
      <Divider color="primary" />
      <br />
    </>
  );
}

export default Title;
