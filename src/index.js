/* eslint-disable consistent-return */

import url from 'url';
import fs from 'fs-promise';
import os from 'os';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
import Multispinner from 'multispinner';

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

const pageLoader = async (address, outputDir = '.') => {
  try {
    const htmlResponse = await axios.get(address);
    const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    const $ = cheerio.load(htmlResponse.data);
    const newFileName = generateName(address, 'html');
    const hrefs = $('link').map((i, elem) => $(elem).attr('href')).get();
    const scripts = $('script[src]').map((i, elem) => $(elem).attr('src')).get();
    const links = [...hrefs, ...scripts];
    const multispinner = new Multispinner([...new Set(links)], { preText: 'Downloading' });  // SPINNER!!!!!!!!!
    if (links.length > 0) {
      const newFolderName = generateName(address, 'folder');
      const newFolderPath = path.join(tmpDir, newFolderName);
      await fs.mkdirp(newFolderPath);
      const data = await Promise.all(links.map(async (link) => {
        let linkEdit = '';
        if (link[0] === '/' && link[1] === '/') {
          linkEdit = `http:${link}`;
        } else if (link[0] === '/') {
          linkEdit = url.format({ protocol: url.parse(address).protocol,
            hostname: url.parse(address).hostname,
            pathname: link });
        } else {
          linkEdit = link;
        }
        const newSubFileName = generateName(linkEdit);
        const newFilePath = path.join(newFolderPath, newSubFileName);
        const newFileRelPath = path.join(newFolderName, newSubFileName);
        try {
          const response = await axios.get(linkEdit, { responseType: 'arraybuffer' });
          await fs.writeFile(newFilePath, response.data, 'binary');
          multispinner.success(link); // SPINNER!!!!!!!!!
        } catch (err) {
          if (err.response) {
            multispinner.error(link); // SPINNER!!!!!!!!!
          }
        }
        if ($(`link[href='${link}']`).attr('href')) {
          return { selector: `link[href='${link}']`, attr: 'href', newValue: newFileRelPath };
        }
        return { selector: `script[src='${link}']`, attr: 'src', newValue: newFileRelPath };
      }));
      const newHtml = changeAttributes($, data);
      await fs.writeFile(path.join(tmpDir, newFileName), newHtml.html());
      await fs.stat(outputDir);
      await fs.copy(path.join(tmpDir, newFileName), path.join(outputDir, newFileName));
      await fs.copy(path.join(tmpDir, newFolderName), path.join(outputDir, newFolderName));
      await fs.remove(path.join(tmpDir));
      return Promise.resolve('Download completed successfully');
    }
  } catch (err) {
    if (err.response) {
      return Promise.reject(`Download Error. ${err.message} on url ${err.config.url}`);
    } else if (err.code === 'ENOENT') {
      return Promise.reject(`Write Error. Path '${outputDir}' does not exist`);
    }
    return Promise.reject(err);
  }
};

export default pageLoader;
