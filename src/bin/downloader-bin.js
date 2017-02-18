#!/usr/bin/env node

import commander from 'commander';
import colors from 'colors';
import pageLoader from '../';

commander
  .version('0.1.4')
  .description('Download a page from www and use it local')
  .arguments('<address>')
  .option('-o, --output [dir]', 'Directory for download')
  .action(address =>
  pageLoader(address, commander.output)
  .then(result => console.log(result))
  .catch(error => console.log(error.red)))
  .parse(process.argv);
