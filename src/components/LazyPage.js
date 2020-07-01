import React from 'react';
import LazyComponent from '@/components/LazyComponent';
import OverlayLoader from '@/components/OverlayLoader';

export default (load, opts = {}) => LazyComponent(load, {
  LoaderComponent: () => <OverlayLoader style={{ backgroundColor: 'white' }} />,
  ...opts,
});
