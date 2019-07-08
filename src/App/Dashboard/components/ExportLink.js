import React from 'react';
import PropTypes from 'prop-types';

const ExportLink = ({ options }) => {
  options = options || { allScripts: true, allConfigKeys: true };
  let q = '';
  Object.keys(options).forEach((key, i) => {
    q += `${key}=${options[key]}`;
    if (i < (Object.keys(options).length - 1)) q += '&';
  });

  return (
    <a
      target="_blank"
      style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'inherit' }}
      rel="noopener noreferrer"
      href={`/export-data?${q}`}
    >Export</a>
  );
};

ExportLink.propTypes = {
  options: PropTypes.object
};

export default ExportLink;
