 /* eslint-disable consistent-return */

import url from 'url';
import fs from 'fs';
import os from 'os';
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
  const tmpDir = os.tmpdir();
  const domainName = `${url.parse(address).protocol}//${url.parse(address).host}`;
  const responseData = htmlResponse.data;
  const $ = cheerio.load(responseData);
  const newFileName = generateName(address, 'html');
  const hrefs = $('link').map((i, elem) => $(elem).attr('href')).get();
  const scripts = $('script[src]').map((i, elem) => $(elem).attr('src')).get();
  const links = [...hrefs, ...scripts];

  if (links.length > 0) {
    const newFolderName = generateName(address, 'folder');
    const newFolderPath = path.join(tmpDir, newFolderName);
    fs.mkdirSync(newFolderPath);
    return Promise.all(links.map((link) => {
      let linkEdit = '';
      if (link[0] === '/' && link[1] === '/') {
        linkEdit = `http:${link}`;
      } else if (link[0] === '/') {
        linkEdit = `${domainName}${link}`;
      } else {
        linkEdit = link;
      }
      const newSubFileName = generateName(linkEdit);
      const newFilePath = path.join(newFolderPath, newSubFileName);
      const newFileRelPath = path.join(newFolderName, newSubFileName);
      $(`link[href='${link}']`).attr('href', newFileRelPath);
      $(`script[src='${link}']`).attr('src', newFileRelPath);
      return axios.get(linkEdit, {
        responseType: 'arraybuffer',
      }).then((response) => {
        fs.writeFileSync(newFilePath, response.data, 'binary');
      });
    })).then(() => {
      fs.writeFileSync(path.join(tmpDir, newFileName), $.html());
      fs.renameSync(path.join(tmpDir, newFileName), path.join(outputDir, newFileName));
      fs.renameSync(path.join(tmpDir, newFolderName), path.join(outputDir, newFolderName));
    });
  }
});

export default pageLoader;
