import React from 'react';
import copy from '@/constants/copy/users';
import { setDocumentTitle, setNavSection } from '@/AppContext';
import Hospitals from './Hospitals';

const HospitalsPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setNavSection('hospitals');

  return (
    <>
      <Hospitals />
    </>
  );
};

export default HospitalsPage;
