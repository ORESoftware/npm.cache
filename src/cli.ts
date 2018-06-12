#!/usr/bin/env node
'use strict';

import * as cp from 'child_process';
import residence = require('residence');
import * as path from "path";
import async = require('async');
import chalk from "chalk";

const root = residence.findProjectRoot(process.cwd());

if (!root) {
  throw 'Could not find project root given cwd => ' + process.cwd();
}

let pkg: any, packages: {[key:string]: boolean}, docker2gConf: any;

try{
  pkg = require(path.resolve(root + '/package.json'));

}
catch(err){
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

const keys = Object.keys(deps).filter(function(k){
    return !packages[k];
});

async.eachLimit(keys, 4, function (k, cb) {

  const version = deps[k];

  const c = cp.spawn('bash');

  const cmd = `npm cache add "${k}@${version}";`;
  console.log('running command:', cmd);
  c.stdin.end(cmd);
  c.stderr.pipe(process.stderr);

  c.once('exit', cb);


}, function(err: any){

  if(err){
    throw err.message || err;
  }

  console.log('all done here.');
  process.exit(0);

});

