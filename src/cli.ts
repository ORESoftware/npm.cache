#!/usr/bin/env node
'use strict';

import * as cp from 'child_process';
import residence = require('residence');
import * as path from "path";
import async = require('async');
import chalk from "chalk";
import {cacheHas} from "./cache-has";
import log from './logger';

const root = residence.findProjectRoot(process.cwd());

if (!root) {
  throw 'Could not find project root given cwd => ' + process.cwd();
}

let pkg: any, packages: { [key: string]: boolean }, docker2gConf: any;

try {
  pkg = require(path.resolve(root + '/package.json'));

}
catch (err) {
  console.error(`could not load package.json file at path ${root}.`);
  throw err.message;
}

try {
  docker2gConf = require(root + '/.docker.r2g/config.js');
  docker2gConf = docker2gConf.default || docker2gConf;
  packages = docker2gConf.packages;
}
catch (err) {
  console.error(chalk.magentaBright('Could not read your .docker.r2g/config.js file.'));
  console.error(err.message);
}

packages = packages || {};

const deps = Object.assign(
  {},
  pkg.optionalDependencies || {},
  pkg.devDependencies || {},
  pkg.dependencies || {},
);

const keys = Object.keys(deps).filter(function (k) {
  return !packages[k];
});

async.autoInject({

    getCacheLocation: function (cb: any) {

      const k = cp.spawn(`bash`);

      k.stdin.end(`npm get cache;`);

      let stdout = '';

      k.stdout.on('data', function (v) {
        stdout += String(v);
      });

      k.once('exit', function (code) {
        if (code > 0) {
          cb('Exit code was greater than 0.');
        }
        else {
          cb(null, stdout);
        }
      });

    },

    updateCache: function (getCacheLocation: string, cb: any) {

      async.eachLimit(keys, 5, function (k, cb) {

        const version = deps[k];

        cacheHas(getCacheLocation, k, version, function (err: any, has: boolean) {

          if (err) {
            return cb(err);
          }

          if (has) {
            log.info('npm cache already has version:', version);
            return cb(null);
          }

          const c = cp.spawn('bash');

          const cmd = `npm cache add "${k}@${version}";`;
          log.info('running command:', cmd);
          c.stdin.end(cmd);
          c.stderr.pipe(process.stderr);

          c.once('exit', cb);

        });

      }, cb);

    }

  },

  function (err: any) {

    if (err) {
      throw err.message || err;
    }

    log.info('all done here.');
    process.exit(0);

  });




