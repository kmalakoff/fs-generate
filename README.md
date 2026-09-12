# fs-generate

Utilities to create file system structures containing directories, files, hard
links, and symbolic links.

```sh
npm install fs-generate
```

Provide an object with forward slashes-delimited path keys describing the desired directory structure and it will be created for you.

It updates existing entries to match the requested structure. It does not
remove entries that are not in the structure.

## Example

Save this as a CommonJS `.cjs` file:

```js
const path = require('path');
const generate = require('fs-generate');

var structure = {
  'file1': 'a',
  'file2': 'b',
  'filesymlink1': '~dir3/dir4/file1', // symbolic link starts with ~
  'dir1': null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/filesymlink2': '~dir2/file1', // symbolic link starts with ~
  'dir3/filelink2': ':dir2/file1', // hard link starts with :
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  'dir3/dir4/dirsymlink1': '~dir2', // symlink starts with ~
};

generate(path.join(__dirname, 'dest'), structure, function (error) {
  if (error) throw error;
  console.log('Created dest');
});

/*
- dest
  - file1
  - file2
  - filesymlink1 (symlink to dir3/dir4/file1)
  - dir1
  - dir2
    - file1
    - file2
  - dir3
    - filesymlink2 (symlink to dir2/file1)
    - filelink2 (hard link to dir2/file1)
    - dir4
      - file1
      - dir5
      - dirsymlink1 (symlink to dir2)
*/

```

The function also returns a promise when you omit the callback: `await
generate(destination, structure)`.
