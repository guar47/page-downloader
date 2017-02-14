/* eslint-env node, jest */
/* eslint-disable no-console */

import fs from 'fs';
import os from 'os';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src/';

axios.defaults.adapter = httpAdapter;

const htmlbody = fs.readFileSync('__tests__/__fixtures__/template/hexlet-io-courses.html', 'utf8');

test('check dowloaded file', (done) => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, htmlbody);
  const address = 'http://localhost/testpath';
  const tmpDir = fs.mkdtempSync(os.tmpdir());
  console.log(`Current tmp directory for tests - ${tmpDir}`);
  pageLoader(address, tmpDir).then(() => {
    const file = fs.readFileSync(`${tmpDir}/localhost-testpath.html`, 'utf8');
    expect(file).toBe(htmlbody);
    done();
  });
});
