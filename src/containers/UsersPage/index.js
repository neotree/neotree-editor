import React from 'react';
import copy from '@/constants/copy/users';
import { setDocumentTitle, setNavSection } from '@/AppContext';
import Users from './Users';

const UsersPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setNavSection('users');

  return (
    <>
      <Users />
    </>
  );
};

export default UsersPage;
