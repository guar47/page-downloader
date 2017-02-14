/* eslint-env node, jest */

import fs from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/';

axios.defaults.adapter = httpAdapter;

test('check dowloaded file', () => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, 'test content http body');
  const address = 'http://localhost/testpath';
  const tmpDir = fs.mkdtempSync('__tests__/__fixtures__/tmp-');
  pageLoader(address, tmpDir).then(() => {
    const file = fs.readFileSync(`${tmpDir}/localhost-testpath.html`, 'utf8');
    expect(file).toBe('test content http body');
  });
});
