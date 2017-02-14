/* eslint-disable no-console */
import url from 'url';
import fs from 'fs';
import axios from 'axios';

export default (address, outputDir = '.') => {
  const parsedURL = url.parse(address);
  const newFileName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}.html`;
  return axios.get(address).then((response) => {
    fs.openSync(`${outputDir}/${newFileName}`, 'w');
    fs.writeFileSync(`${outputDir}/${newFileName}`, response.data);
  });
};
