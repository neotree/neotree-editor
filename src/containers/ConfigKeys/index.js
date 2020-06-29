import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import copy from '@/constants/copy/configKeys';

const ConfigKeys = () => {
  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}
    </>
  );
};

ConfigKeys.propTypes = {};

export default ConfigKeys;
