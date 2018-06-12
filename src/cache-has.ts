'use strict';

import semver = require('semver');
import async = require('async');
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export const cacheHas = function (getCacheLocation: string, dep: string, version: string, cb: any) {

  const dir = path.resolve(getCacheLocation + '/' + dep);

  fs.readdir(dir, function (err, items) {

    if (err) {
      return cb(err);
    }

    const matches = items.some(function (v) {
      return semver.eq(v, version);
    });

    return cb(null, matches);

  });

};
