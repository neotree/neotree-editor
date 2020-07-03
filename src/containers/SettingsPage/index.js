import React from 'react';
import copy from '@/constants/copy/settings';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';

const SettingsPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);

  return (
    <>

    </>
  );
};

export default SettingsPage;
