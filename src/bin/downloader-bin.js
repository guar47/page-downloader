#!/usr/bin/env node

import commander from 'commander';
import pageLoader from '../';

commander
  .version('0.0.2')
  .description('Download a page from www')
  .arguments('<address>')
  .option('-o, --output [dir]', 'Directory for download')
  .action(address =>
  pageLoader(address, commander.output))
  .parse(process.argv);
