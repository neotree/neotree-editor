import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import copy from '@/constants/copy/scripts';

const Scripts = () => {
  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}
    </>
  );
};

Scripts.propTypes = {};

export default Scripts;
