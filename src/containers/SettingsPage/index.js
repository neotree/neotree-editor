import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import copy from '@/constants/copy/settings';

const SettingsPage = () => {
  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}
    </>
  );
};

SettingsPage.propTypes = {};

export default SettingsPage;
