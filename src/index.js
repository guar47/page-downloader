/* eslint-disable consistent-return */

import url from 'url';
import fs from 'fs-promise';
import os from 'os';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
// import multispinner from 'multispinner';

const generateName = (address, type) => {
  const parsedURL = url.parse(address);
  let newName = url.format({
    hostname: parsedURL.hostname.replace(/[^0-9a-z]/gi, '-'),
    pathname: parsedURL.pathname.replace(/\//g, '-'),
  });
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

const changeAttributes = (obj, atrArray) => {
  const newHtml = obj;
  atrArray.map(atrributes =>
    newHtml(atrributes.selector).attr(atrributes.attr, atrributes.newValue));
  return newHtml;
};

const pageLoader = (address, outputDir = '.') => axios.get(address).then((htmlResponse) => {
  const parsedURL = url.parse(address);
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  const responseData = htmlResponse.data;
  const $ = cheerio.load(responseData);
  const newFileName = generateName(address, 'html');
  const hrefs = $('link').map((i, elem) => $(elem).attr('href')).get();
  const scripts = $('script[src]').map((i, elem) => $(elem).attr('src')).get();
  const links = [...hrefs, ...scripts];
  if (links.length > 0) {
    const newFolderName = generateName(address, 'folder');
    const newFolderPath = path.join(tmpDir, newFolderName);
    return fs.mkdirp(newFolderPath)
    .catch(err => Promise.reject(err))
    .then(() => Promise.all(links.map((link) => {
      let linkEdit = '';
      if (link[0] === '/' && link[1] === '/') {
        linkEdit = `http:${link}`;
      } else if (link[0] === '/') {
        linkEdit = url.format({
          protocol: parsedURL.protocol,
          hostname: parsedURL.hostname,
          pathname: link,
        });
      } else {
        linkEdit = link;
      }
      const newSubFileName = generateName(linkEdit);
      const newFilePath = path.join(newFolderPath, newSubFileName);
      const newFileRelPath = path.join(newFolderName, newSubFileName);
      return axios.get(linkEdit, {
        responseType: 'arraybuffer',
      }).catch(err => Promise.reject(err))
      .then(response => fs.writeFile(newFilePath, response.data, 'binary')
      .catch(err => Promise.reject(err))
      .then(() => {
        if ($(`link[href='${link}']`).attr('href')) {
          return { selector: `link[href='${link}']`, attr: 'href', newValue: newFileRelPath };
        }
        return { selector: `script[src='${link}']`, attr: 'src', newValue: newFileRelPath };
      }));
    }))).catch(err => Promise.reject(err))
    .then((data) => {
      const newHtml = changeAttributes($, data);
      return fs.writeFile(path.join(tmpDir, newFileName), newHtml.html());
    })
    .catch(err => Promise.reject(err))
      .then(() => fs.stat(outputDir))
      .catch((err) => {
        if (err.code === 'ENOENT') {
          return Promise.reject(`Write Error. Path '${outputDir}' does not exist`);
        } return Promise.reject(err);
      })
      .then(() => fs.copy(path.join(tmpDir, newFileName), path.join(outputDir, newFileName)))
      .catch(err => Promise.reject(err))
      .then(() => fs.copy(path.join(tmpDir, newFolderName), path.join(outputDir, newFolderName)))
      .catch(err => Promise.reject(err))
      .then(() => fs.remove(path.join(tmpDir)))
      .catch(err => Promise.reject(err))
      .then(() => Promise.resolve('Download completed successfully'));
  }
}).catch((err) => {
  if (err.response) {
    return Promise.reject(`Download Error. ${err.message} on url ${err.config.url}`);
  } return Promise.reject(err);
});


export default pageLoader;
