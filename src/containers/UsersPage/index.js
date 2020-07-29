import React from 'react';
import copy from '@/constants/copy/users';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle, setNavSection } from '@/contexts/app';
import Users from './Users';

const UsersPage = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);
  setNavSection('users');

  return (
    <>
      <Users />
    </>
  );
};

export default UsersPage;
