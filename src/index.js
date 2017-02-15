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

const pageLoader = (address, outputDir = '.') => axios.get(address).then((htmlResponse) => {
  const domain = `${url.parse(address).protocol}//${url.parse(address).host}`;
  const responseData = htmlResponse.data;
  const $ = cheerio.load(responseData);
  const links = [];
  $('link').each((i, elem) => {
    links.push($(elem).attr('href'));
  });
  $('script[src]').each((i, elem) => {
    links.push($(elem).attr('src'));
  });
  if (links.length > 0) {
    const newFolderName = nameGenerator(address, 'folder');
    const newFolderPath = path.join(outputDir, newFolderName);
    fs.mkdirSync(newFolderPath);
    links.forEach((link) => {
      let linkEdit = '';
      if (link[0] === '/' && link[1] === '/') {
        linkEdit = `http:${link}`;
      } else if (link[0] === '/') {
        linkEdit = `${domain}${link}`;
      } else {
        linkEdit = link;
      }
      const newFileName = nameGenerator(linkEdit, 'other');
      const newFilePath = path.join(newFolderPath, newFileName);
      const newFileRelPath = path.join(newFolderName, newFileName);
      $(`link[href='${link}']`).attr('href', newFileRelPath);
      $(`script[src='${link}']`).attr('src', newFileRelPath);
      return axios.get(linkEdit, {
        responseType: 'arraybuffer',
      }).then((response) => {
        fs.writeFileSync(newFilePath, response.data, 'binary');
      });
    });
  }
  const newDataOutput = $.html();
  const newFileName = nameGenerator(address, 'html');
  fs.writeFileSync(path.join(outputDir, newFileName), newDataOutput);
});

export default pageLoader;
