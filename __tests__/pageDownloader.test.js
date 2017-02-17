/* eslint-env node, jest */

import fs from 'fs-promise';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/';

const testPath = path.join('__tests__', '__fixtures__');

beforeEach(() => {
  nock.disableNetConnect();
  nock('http://localhost')
    .get('/testpath')
    .reply(200, fs.readFileSync(path.join(testPath, 'hexlet-io-courses.html'), 'utf8'))
    .get('/lessons.rss')
    .reply(200, fs.readFileSync(path.join(testPath, 'lessons.rss'), 'utf8'))
    .get('/error404')
    .reply(404)
    .get('/assets/application.css')
    .reply(200, fs.readFileSync(path.join(testPath, 'application.css'), 'utf8'))
    .get('/assets/icons/default/favicon.ico')
    .reply(200, fs.readFileSync(path.join(testPath, 'favicon.ico'), 'binary'));
});

test('main html download checker', (done) => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  console.log(tmpDir);
  pageLoader('http://localhost/testpath', tmpDir).then((result) => {
    const mainFile = path.join(tmpDir, 'localhost-testpath.html');
    const files = fs.readdirSync(path.join(tmpDir, 'localhost-testpath_files'));
    const subFile = path.join(tmpDir, 'localhost-testpath_files', 'localhost-lessons.rss');
    Promise.all([fs.readFile(mainFile, 'utf8'),
      fs.readFile(path.join('__tests__', '__fixtures__', 'hexlet-io-courses_subst.html'), 'utf8')])
      .then((content) => {
        expect(content[0]).toBe(content[1]);
      }).then(() => {
        expect(fs.access(subFile)).toBeTruthy();
        expect(files.includes('localhost-lessons.rss')).toBeTruthy();
        expect(result).toBe('Download completed successfully');
        done();
      });
  });
});
test('network error checker', (done) => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  pageLoader('http://localhost/error404', tmpDir).catch((err) => {
    expect(err).toBe(('Download Error. Request failed with status code 404 on url http://localhost/error404'));
    done();
  });
});
test('folder exist error checker', (done) => {
  pageLoader('http://localhost/testpath', path.join(testPath, 'fakeFolder')).catch((err) => {
    expect(err).toBe(('Write Error. Path \'__tests__/__fixtures__/fakeFolder\' does not exist'));
    done();
  });
});
