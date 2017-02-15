/* eslint-disable no-console */
import url from 'url';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
// import cheerio from 'cheerio';

const nameGenerator = (address, type) => {
  const parsedURL = url.parse(address);
  let newName = '';
  switch (type) {
    case 'html':
      newName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}.html`;
      break;
    case 'folder':
      newName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}_files`;
      break;
    default:
      return newName;
  }
  return newName;
};

export default (address, outputDir = '.') => {
  const newFileName = nameGenerator(address, 'html');
  const newFolderName = nameGenerator(address, 'folder');
  return axios.get(address, {
    responseType: 'arraybuffer',
  }).then((response) => {
    fs.writeFileSync(path.join(outputDir, newFileName), response.data, 'binary');
  }).then(() => {
    fs.mkdirSync(path.join(outputDir, newFolderName));
  });
};
