/* eslint-disable no-console */
import url from 'url';
import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

export default (address, outputDir = '.') => {
  const parsedURL = url.parse(address);
  const newFileName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}.html`;
  const newFolderName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}_files`;
  return axios.get(address).then((response) => {
    fs.writeFileSync(`${outputDir}/${newFileName}`, response.data);
  }).then(() => {
    fs.mkdirSync(`${outputDir}/${newFolderName}`);
  });
};
