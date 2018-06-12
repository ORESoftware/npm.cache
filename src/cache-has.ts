'use strict';

import semver = require('semver');
import async = require('async');
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

//project
import log from './logger';

//////////////////////////////////////////////////////////////////////////

export const cacheHas = function (getCacheLocation: string, dep: string, version: string, cb: any) {

  const dir = path.resolve(getCacheLocation + '/' + dep);

  fs.readdir(dir, function (err, items) {

    if(err && /no such file or directory/i.test(String(err.message || err))){
      log.info('zero cached versions of dependency with name:', dep);
      return cb(null, false);
    }
    else if (err) {
      return cb(err);
    }

    const matches = items.some(function (v) {
      return semver.eq(v, version) || semver.satisfies(v, version);
    });

    return cb(null, matches);

  });

};
