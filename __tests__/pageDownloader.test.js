/* eslint-env node, jest */
/* eslint-disable no-console */

import fs from 'fs';
import os from 'os';
import nock from 'nock';
import pageLoader from '../src/';

const htmlbody = fs.readFileSync('__tests__/__fixtures__/template/hexlet-io-courses.html', 'utf8');

test('main html download checker', (done) => {
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
test('main html download checker', (done) => {
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
