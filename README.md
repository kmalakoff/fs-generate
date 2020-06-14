# fs-generate

Utilities to set up file system structures (directories, files, and symlinks).

Provide an object with forward slashes-delimited path keys describing the desired directory structure and it will be created for you.

It will not remove pre-exisiting directories, files, and symlinks so if you need this functionality, please submit a pull request!

**Example**

```
var path = require('path');
var generate = require('fs-generate');

var structure = {
  'file1': 'a',
  'file2': 'b',
  'filesymlink1': '~dir3/dir4/file1', // symlink starts with ~
  'dir1': null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/filesymlink2': '~dir2/file1' // symlink starts with ~
  'dir3/filelink2': ':dir2/file1', // link starts with :
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  'dir3/dir4/dirsymlink1': '~dir2', // symlink starts with ~
};

generate(path.join(__dirname, 'dest'), structure, function(err) { /* done */ });

/*
- dest
  - file1
  - file2
  - filesymlink1 (symlink  to dir3/dir4/file1)
  - dir1
  - dir2
    - file1
    - file2
  - dir3
    - filesymlink1 (symlink to dir2/file1)
    - filelink1 (link to dir2/file1)
    - dir4
      - file1
      - dir5
      - dirsymlink1 (symlink to dir2)
*/

```
