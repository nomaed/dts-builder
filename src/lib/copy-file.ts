import * as fs from "fs";

/**
 * @see http://stackoverflow.com/a/14387791
 */
export function copyFile(source: string, target: string, cb: (err?: NodeJS.ErrnoException, target?: string) => any) {

  const rd = fs.createReadStream(source);
  const wr = fs.createWriteStream(target);

  let cbCalled = false;
  const done = (err?: NodeJS.ErrnoException, res?: string) => {
    if (cbCalled) return;
    cb(err, res);
    cbCalled = true;
  };

  rd.on("error", (err: NodeJS.ErrnoException) => { done(err); });
  wr.on("error", (err: NodeJS.ErrnoException) => { done(err); });
  wr.on("close", () => { done(undefined, target); });

  rd.pipe(wr);
}
