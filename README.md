# hyperdrive-ln

create symbolic link between [hyperdrives](https://github.com/mafintosh/hyperdrive)

`npm i hyperdrive-ln`

## Usage

```js
const ln = require('hyperdrive-ln')

var drive = hyperdrive(memdb())
var archive = drive.createArchive()

ln.link(archive, 'linkfile', <ARCHIVE KEY>, cb) // create symlink to another archive
ln.readlink(archive, 'linkfile', cb) // get linked archive key

// assume link(archive, 'path/to/file', <ARCHIVE KEY>)
ln.resolve(archive, 'path/to/file/within/linked/archive', cb) // returns (err, <ARCHIVE KEY>, 'within/linked/archive')
```
