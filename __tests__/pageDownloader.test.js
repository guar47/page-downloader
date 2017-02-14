/* eslint-env node, jest */

import fs from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/';

axios.defaults.adapter = httpAdapter;
const htmlbody = fs.readFileSync('__tests__/__fixtures__/hexlet-io-courses.html', 'utf8');

test('check dowloaded file', () => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, htmlbody);
  const address = 'http://localhost/testpath';
  const tmpDir = fs.mkdtempSync('__tests__/__fixtures__/tmp-');
  console.log(`Current tmp directory for tests - ${tmpDir}`);
  pageLoader(address, tmpDir).then(() => {
    const file = fs.readFileSync(`${tmpDir}/localhost-testpath.html`, 'utf8');
    expect(file).toBe(htmlbody);
  });
});
