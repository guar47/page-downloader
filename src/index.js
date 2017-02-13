/* eslint-disable no-console */
import url from 'url';
import fs from 'fs';

export default (address, outputDir) => {
  const parsedURL = url.parse(address);
  const newFileName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace('/', '-')}.html`;
  fs.openSync(`${outputDir}/${newFileName}`, 'w');
  
};
