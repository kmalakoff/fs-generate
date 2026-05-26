declare module 'fs.realpath' {
  import * as fs from 'fs';
  const realpath: typeof fs.realpath;
  export = realpath;
}
