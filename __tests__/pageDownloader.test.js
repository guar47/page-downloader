/* eslint-env node, jest */

import fs from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/';

const host = 'http://localhost';

axios.defaults.adapter = httpAdapter;
axios.defaults.host = host;

test('check name dowloaded file', () => {
  nock(host)
    .get('/testpath')
    .reply(200, 'test content http body');
  const address = 'http://localhost/testpath';
  const tmpDir = fs.mkdtempSync('__tests__/__fixtures__/tmp-');
  const result = 'test content http body';
  pageLoader(address, tmpDir);
  expect(fs.readFileSync(`${tmpDir}/test-com-testpath.html`, 'utf8')).toBe(result);
});
