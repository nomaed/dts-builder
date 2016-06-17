import * as fs from 'fs';

export function findFiles(dir: string, match: RegExp = /\.d\.ts$/): Array<string> {
  if (!dir || typeof dir !== 'string') {
    throw new TypeError('Invalid directory');
  }
  if (!(match instanceof RegExp)) {
    throw new TypeError('Invalid match regexp');
  }
  return getMatches(dir, match);
}

/**
 * Iterate over directories and find all matching files (synchronous)
 * @param {string} dir
 * @param {RegExp} match
 * @returns {string[]}
 */
function getMatches(dir: string, match: RegExp): Array<string> {
  let files: Array<string> = [];
  let dirs: Array<string> = [];

  // get list of current dir's files, and file by type
  fs.readdirSync(dir).sort().forEach(file => {
    const path = `${dir}/${file}`;
    const stat = fs.statSync(path);
    if (!stat) return;
    if (stat.isFile()) {
      files.push(path);
    } else if (stat.isDirectory()) {
      dirs.push(path);
    } else {
      console.warn('DBG: Unknown file', stat);
    }
  });

  // save matched files
  let matches = files.filter(file => match.test(file));

  // grab matches for sub-directories
  dirs.forEach(path => {
    const children = getMatches(path, match);
    if (children && children.length) {
      matches = matches.concat(children);
    }
  });

  return matches;
}