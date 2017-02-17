/* eslint-env node, jest */

import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/';

const testPath = path.join('__tests__', '__fixtures__');
const htmlbody = fs.readFileSync(path.join(testPath, 'hexlet-io-courses.html'), 'utf8');
const subfileBody = fs.readFileSync(path.join(testPath, 'lessons.rss'), 'utf8');
const address = 'http://localhost/testpath';

beforeAll(() => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, htmlbody)
    .get('/lessons.rss')
    .reply(200, subfileBody);
});

test('main html download checker', (done) => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  pageLoader(address, tmpDir).then(() => {
    const mainFile = path.join(tmpDir, 'localhost-testpath.html');
    const files = fs.readdirSync(path.join(tmpDir, 'localhost-testpath_files'));
    const subFile = path.join(tmpDir, 'localhost-testpath_files', 'localhost-lessons.rss');
    Promise.all([fs.readFile(mainFile, 'utf8'),
      fs.readFile(path.join('__tests__', '__fixtures__', 'hexlet-io-courses_subst.html'), 'utf8')])
    .then((content) => {
      expect(content[0]).toBe(content[1]);
    }).then(() => {
      expect(fs.exists(subFile)).toBeTruthy();
      expect(files.includes('localhost-lessons.rss')).toBeTruthy();
      done();
    });
  });
});
