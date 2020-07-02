import React from 'react';
import Overlay from '@/components/Overlay';
import LinearProgress from '@material-ui/core/LinearProgress';

export default function PageLoader(props) {
  return <Overlay><LinearProgress {...props} color="secondary" /></Overlay>;
}
