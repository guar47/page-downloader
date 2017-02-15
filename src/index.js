/* eslint-disable no-console */
import url from 'url';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';

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
    case 'other':
      newName = `${parsedURL.hostname.replace(/[^0-9a-z]/gi, '-')}${parsedURL.pathname.replace(/\//g, '-')}`;
      break;
    default:
      return newName;
  }
  return newName;
};

const linksLoader = (html, newFolderPath) => {
  const $ = cheerio.load(html);
  const links = [];
  $('link').each((i, elem) => {
    links[i] = $(elem).attr('href');
  });
  $('script[src]').each((i, elem) => {
    links[i] = $(elem).attr('src');
  });
  links.join(', ');
  if (links.length > 0) {
    fs.mkdirSync(newFolderPath);
    links.forEach((link) => {
      const newFileName = nameGenerator(link, 'other');
      return axios.get(link).then((response) => {
        fs.writeFileSync(path.join(newFolderPath, newFileName), response.data, 'binary');
      });
    });
  }
};

const pageLoader = (address, outputDir = '.') => {
  const newFileName = nameGenerator(address, 'html');
  const newFolderPath = path.join(outputDir, nameGenerator(address, 'folder'));
  return axios.get(address).then((response) => {
    fs.writeFileSync(path.join(outputDir, newFileName), response.data, 'binary');
    linksLoader(response.data, newFolderPath);
  });
};

export default pageLoader;
