/* eslint-env node, jest */

import fs from 'fs-promise';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/';

const testPath = path.join('__tests__', '__fixtures__');

beforeAll(() => {
  nock.disableNetConnect();
});

beforeEach(() => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, fs.readFileSync(path.join(testPath, 'hexlet-io-courses.html'), 'utf8'))
    .get('/lessons.rss')
    .reply(200, fs.readFileSync(path.join(testPath, 'lessons.rss'), 'utf8'))
    .get('/assets/application.css')
    .reply(200, fs.readFileSync(path.join(testPath, 'application.css'), 'utf8'))
    .get('/assets/icons/default/favicon.ico')
    .reply(200, fs.readFileSync(path.join(testPath, 'favicon.ico'), 'binary'))
    .get('/error404')
    .reply(404)
    .get('/bodyFakeJS')
    .reply(200, '<script src="http://localhost/fakeJS.js"></script>')
    .get('/fakeJS.js')
    .reply(403);
});

test('main html download checker', async (done) => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  const mainFile = path.join(tmpDir, 'localhost-testpath.html');
  const subFile = path.join(tmpDir, 'localhost-testpath_files', 'localhost-lessons.rss');
  const [result, files, expectContent, toBeContent] = await Promise.all([
    await pageLoader('http://localhost/testpath', tmpDir),
    await fs.readdir(path.join(tmpDir, 'localhost-testpath_files')),
    await fs.readFile(mainFile, 'utf8'),
    await fs.readFile(path.join('__tests__', '__fixtures__', 'hexlet-io-courses_subst.html'), 'utf8'),
  ]);
  expect(expectContent).toBe(toBeContent);
  expect(fs.access(subFile)).toBeTruthy();
  expect(files.includes('localhost-lessons.rss')).toBeTruthy();
  expect(result).toBe('Download completed successfully');
  done();
});

test('main file network error checker', async (done) => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  try {
    await pageLoader('http://localhost/error404', tmpDir);
  } catch (error) {
    expect(error).toBe('Download Error. Request failed with status code 404 on url http://localhost/error404');
  }
  done();
});

test('subfiles network error checker', async (done) => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  try {
    await pageLoader('http://localhost/bodyFakeJS', tmpDir);
  } catch (error) {
    expect(error).toBe(('Download Error. Request failed with status code 403 on url http://localhost/fakeJS.js'));
  }
  done();
});

test('folder exist error checker', async (done) => {
  try {
    await pageLoader('http://localhost/testpath', path.join(testPath, 'fakeFolder'));
  } catch (error) {
    expect(error).toBe(('Write Error. Path \'__tests__/__fixtures__/fakeFolder\' does not exist'));
  }
  done();
});
