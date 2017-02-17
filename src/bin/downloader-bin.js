#!/usr/bin/env node

import commander from 'commander';
import pageLoader from '../';

commander
  .version('0.1.1')
  .description('Download a page from www and use it local')
  .arguments('<address>')
  .option('-o, --output [dir]', 'Directory for download')
  .action(address =>
  pageLoader(address, commander.output)
  .catch(error => error)
  .then('Download successfully complete'))
  .parse(process.argv);
