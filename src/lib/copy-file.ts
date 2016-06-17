import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;

/**
 * @link http://stackoverflow.com/a/14387791
 * @param {string} source filename
 * @param {string} target filename
 * @param {Function} cb
 */
export function copyFile(source: string, target: string, cb: (err: ErrnoException, target: string) => any) {

  const rd = fs.createReadStream(source);
  const wr = fs.createWriteStream(target);

  let cbCalled = false;
  const done = (err: NodeJS.ErrnoException, res?: string) => {
    if (cbCalled) return;
    cb(err, res);
    cbCalled = true;
  };

  rd.on("error", (err: ErrnoException) => { done(err); });
  wr.on("error", (err: ErrnoException) => { done(err); });
  wr.on("close", () => { done(null, target); });

  rd.pipe(wr);
}
