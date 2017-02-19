#!/usr/bin/env node

import commander from 'commander';
import colors from 'colors';
import pageLoader from '../';

commander
  .version('0.1.5')
  .description('Download a page from www and use it local')
  .arguments('<address>')
  .option('-o, --output [dir]', 'Directory for download')
  .action(async (address) => {
    try {
      const result = await pageLoader(address, commander.output);
      console.log(colors.green(result));
    } catch (error) {
      console.log(colors.red(error));
    }
  })
  .parse(process.argv);
