import React from 'react';
import copy from '@/constants/copy/users';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle, setNavSection } from '@/contexts/app';
import Hospitals from './Hospitals';

const HospitalsPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);
  setNavSection('hospitals');

  return (
    <>
      <Hospitals />
    </>
  );
};

export default HospitalsPage;
