'use strict';

//project
import chalk from "chalk";

export const log = {
  info: console.log.bind(console, chalk.gray.bold('[npm.cache info]')),
  error: console.error.bind(console, chalk.red.bold('[npm.cache error]')),
  warn: console.error.bind(console, chalk.yellow.bold('[npm.cache warning]')),
  debug: function (...args: any[]) {
    true && console.log('[npm.cache broker debugging]', ...args);
  }
};

export default log;
