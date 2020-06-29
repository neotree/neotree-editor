import React from 'react';
import { Helmet } from 'react-helmet';
import copy from '@/constants/copy';

export default function renderDocumentTitle(title = '') {
  return (
    <Helmet>
      <title>{title ? `${title} - ` : ''}{copy.APP_TITLE}</title>
    </Helmet>
  );
}
