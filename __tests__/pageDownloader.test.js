/* eslint-env node, jest */
/* eslint-disable no-console */
import fs from 'fs';
import os from 'os';
import nock from 'nock';
import pageLoader from '../src/';

const htmlbody = fs.readFileSync('__tests__/__fixtures__/hexlet-io-courses.html', 'utf8');
const htmlbodyAfterSubst = fs.readFileSync('__tests__/__fixtures__/hexlet-io-courses_subst.html', 'utf8');
const address = 'http://localhost/testpath';
const tmpDir = os.tmpdir();
console.log(`Current tmp directory for tests - ${tmpDir}`);

beforeEach(() => {
  nock('http://localhost')
    .get('/testpath')
    .reply(200, htmlbody);
});

test('main html download checker and substitution links', (done) => {
  pageLoader(address, tmpDir).then(() => {
    const mainFile = fs.readFileSync(`${tmpDir}/localhost-testpath.html`, 'utf8');
    expect(mainFile).toBe(htmlbodyAfterSubst);
    done();
  });
});
