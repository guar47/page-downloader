 /* eslint-disable consistent-return */

import url from 'url';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';

const generateName = (address, type) => {
  const parsedURL = url.parse(address);
  let newName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}`;
  switch (type) {
    case 'html':
      newName = `${newName}.html`;
      break;
    case 'folder':
      newName = `${newName}_files`;
      break;
    default:
      return newName;
  }
  return newName;
};

const pageLoader = (address, outputDir = '.') => axios.get(address).then((htmlResponse) => {
  const normalizeDomainName = `${url.parse(address).protocol}//${url.parse(address).host}`;
  const responseData = htmlResponse.data;
  const $ = cheerio.load(responseData);
  const normalizeFileName = generateName(address, 'html');
  const hrefs = $('link').map((i, elem) => $(elem).attr('href')).get();
  const scripts = $('script[src]').map((i, elem) => $(elem).attr('src')).get();
  const links = [...hrefs, ...scripts];

  if (links.length > 0) {
    const normalizeFolderName = generateName(address, 'folder');
    const normalizeFolderPath = path.join(outputDir, normalizeFolderName);
    fs.mkdirSync(normalizeFolderPath);
    return Promise.all(links.map((link) => {
      let linkEdit = '';
      if (link[0] === '/' && link[1] === '/') {
        linkEdit = `http:${link}`;
      } else if (link[0] === '/') {
        linkEdit = `${normalizeDomainName}${link}`;
      } else {
        linkEdit = link;
      }
      const normalizeSubFileName = generateName(linkEdit);
      const normalizeFilePath = path.join(normalizeFolderPath, normalizeSubFileName);
      const normalizeFileRelPath = path.join(normalizeFolderName, normalizeSubFileName);
      $(`link[href='${link}']`).attr('href', normalizeFileRelPath);
      $(`script[src='${link}']`).attr('src', normalizeFileRelPath);
      return axios.get(linkEdit, {
        responseType: 'arraybuffer',
      }).then((response) => {
        fs.writeFileSync(normalizeFilePath, response.data, 'binary');
      });
    })).then(() => {
      fs.writeFileSync(path.join(outputDir, normalizeFileName), $.html());
    });
  }
});

export default pageLoader;
