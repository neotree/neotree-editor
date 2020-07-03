import React from 'react';
import copy from '@/constants/copy/configKeys';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';

const ConfigKeys = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);

  return (
    <>
      
    </>
  );
};

export default ConfigKeys;
