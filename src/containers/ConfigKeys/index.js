import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import copy from '@/constants/copy/configKeys';
import { setHeaderTitle } from '@/components/Layout';

const ConfigKeys = () => {
  setHeaderTitle(copy.PAGE_TITLE);

  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}
    </>
  );
};

ConfigKeys.propTypes = {};

export default ConfigKeys;
