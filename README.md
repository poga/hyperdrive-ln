# hyperdrive-ln

create symbolic link between [hyperdrives](https://github.com/mafintosh/hyperdrive)

## Usage

```js
const tape = require('tape')
const memdb = require('memdb')
const hyperdrive = require('hyperdrive')
const ln = require('.')

var drive = hyperdrive(memdb())
var archive = drive.createArchive()

ln.link(archive, 'linkfile', <ARCHIVE KEY>, cb) // create symlink to another archive
ln.readlink(archive, 'linkfile', cb) // get linked archive key
ln.read(drive, archive, 'linkfile', cb) // returns a hyperdrive archive pointed to linked archive
```
