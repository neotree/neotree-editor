import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import copy from '@/constants/copy/authentication';

const Authentication = ({ authType }) => {
  return (
    <>
      {renderDocumentTitle(copy[authType].PAGE_TITLE)}
    </>
  );
};

Authentication.propTypes = {
  authType: PropTypes.oneOf(['sign-in', 'sign-up', 'forgot-password']).isRequired,
};

export default Authentication;
