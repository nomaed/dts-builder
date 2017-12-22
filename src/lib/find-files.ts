import * as fs from "fs";

export function findFiles(dir: string, match: RegExp = /\.d\.ts$/): Promise<Array<string>> {
  if (!dir || typeof dir !== "string") {
    return Promise.reject(`Invalid directory: ${dir}`);
  }
  if (!(match instanceof RegExp)) {
    return Promise.reject(`Invalid match regexp: ${match}`);
  }
  return getMatches(dir, match);
}

/**
 * Iterate over directories and find all matching files (synchronous)
 */
function getMatches(dir: string, match: RegExp): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    const files: Array<string> = [];
    const dirs: Array<string> = [];

    // get list of current dir's files, and file by type
    fs.readdir(dir, (err, curFiles) => {
      if (err) {
        reject(err);
        return;
      }

      curFiles.sort()
        .forEach(file => {
          const path = `${dir}/${file}`;
          const stat = fs.statSync(path);
          if (!stat) return;
          if (stat.isFile()) {
            files.push(path);
          } else if (stat.isDirectory()) {
            dirs.push(path);
          } else {
            console.warn("DBG: Unknown file", stat);
          }
        });

      // save matched files
      let matches = files.filter(file => match.test(file));

      // grab matches for sub-directories

      Promise.all(dirs.map(path => getMatches(path, match)))
        .then((children) => {
          if (children && children.length) {
            matches = matches.concat(...children);
          }
        })
        .then(() => {
          resolve(matches);
        });
    });

  });
}