/* eslint-env node, jest */

import fs from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/';

const htmlbody = fs.readFileSync(path.join('__tests__', '__fixtures__', 'hexlet-io-courses.html'), 'utf8');
const htmlbodyAfterSubst = fs.readFileSync(path.join('__tests__', '__fixtures__', 'hexlet-io-courses_subst.html'), 'utf8');
const address = 'http://localhost/testpath';
const tmpDir = os.tmpdir();

beforeEach(() => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, htmlbody);
});

test('main html download checker and substitution links', (done) => {
  pageLoader(address, tmpDir).then(() => {
    const mainFile = path.join(tmpDir, 'localhost-testpath.html');
    expect(fs.readFileSync(mainFile, 'utf8')).toBe(htmlbodyAfterSubst);
    done();
  });
});
test('check subfiles download', (done) => {
  const files = fs.readdirSync(path.join(tmpDir, 'localhost-testpath_files'));
  const subFile = path.join(tmpDir, 'localhost-testpath_files', 'en-hexlet-io-lessons.rss');
  expect(fs.existsSync(subFile)).toBeTruthy();
  expect(files.includes('en-hexlet-io-lessons.rss')).toBeTruthy();
  done();
});
