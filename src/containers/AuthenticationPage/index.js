import React from 'react';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import Authentication from '@/components/Authentication';
import copy from '@/constants/copy/authentication';
import { useParams } from 'react-router-dom';

const getCopy = authType => {
  switch (authType) {
    case 'forgot-password':
      return { ...copy, ...copy['forgot-password'] };
    case 'change-password':
      return { ...copy, ...copy['change-password'] };
    case 'sign-in':
      return { ...copy, ...copy['sign-in'] };
    case 'sign-up':
      return { ...copy, ...copy['sign-up'] };
    default:
      return {};
  }
};

const AuthenticationPage = () => {
  const { authType } = useParams();

  const copy = getCopy();

  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}

      <Authentication
        authType={authType}
        copy={copy}
      />
    </>
  );
};

export default AuthenticationPage;
