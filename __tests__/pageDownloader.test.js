/* eslint-env node, jest */

import fs from 'fs';
import pageLoader from '../src/';

test('check name dowloaded file', () => {
  const address = 'https://hexlet.io/courses';
  const tmpDir = fs.mkdtempSync('__tests__/__fixtures__/tmp-');
  const result = (fs.readFileSync('__tests__/__fixtures__/emptyhtml.html', 'utf8'));
  pageLoader(address, tmpDir);
  expect(fs.readFileSync(`${tmpDir}/hexlet-io-courses.html`, 'utf8')).toBe(result);
});
