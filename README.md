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
ln.read(drive, archive, 'linkfile', cb) // returns a hyperdrive archive pointed to linked archive

// assume link(archive, 'path/to/file', <ARCHIVE KEY>)
ln.resolve(drive, archive, 'path/to/file/within/linked/archive', cb) // returns (err, nextArchive(<ARCHIVE KEY>), 'within/linked/archive')
```
