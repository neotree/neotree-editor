import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import copy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';

const Scripts = () => {
  setHeaderTitle(copy.PAGE_TITLE);

  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}
      <h1>{copy.PAGE_TITLE}</h1>
    </>
  );
};

Scripts.propTypes = {};

export default Scripts;
