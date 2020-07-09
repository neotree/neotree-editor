import React from 'react';
import { Helmet } from 'react-helmet';
import copy from '@/constants/copy';
import { useAppContext } from '@/contexts/app';

export default function DocumentTitle() {
  const { state: { documentTitle } } = useAppContext();

  return (
    <Helmet>
      <title>{documentTitle ? `${documentTitle} - ` : ''}{copy.APP_TITLE}</title>
    </Helmet>
  );
}
