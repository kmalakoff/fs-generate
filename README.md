# fs-generate
Utilities to set up file system structures (directories, files, and symlinks).

Provide an object with forward slashes-delimited path keys describing the desired directory structure and it will be created for you.

It will not remove pre-exisiting directories, files, and symlinks so if you need this functionality, please submit a pull request!

**Example**

```
var sysPath = require('path');
var generate = require('fs-generate');

var structure = {
  'file1': 'a',
  'file2': 'b',
  'dir1': null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  'link1': '~dir3/dir4/file1', // symlink starts with ~
  'dir3/link2': '~dir2/file1'
};

generate(sysPath.join(__dirname, 'dest'), structure, function(err) { /* done */ });

/*
- dest
  - file1
  - file2
  - link1 (to dir3/dir4/file1)
  - dir1
  - dir2
    - file1
    - file2
  - dir3
    - link2 (to dir2/file1)
    - dir4
      - file1
      - dir5
*/

```
