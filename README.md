# hyperdrive-ln

[![NPM Version](https://img.shields.io/npm/v/hyperdrive-ln.svg)](https://www.npmjs.com/package/hyperfeed) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

create symbolic link between [hyperdrives](https://github.com/mafintosh/hyperdrive)

`npm i hyperdrive-ln`

## Usage

```js
const ln = require('hyperdrive-ln')

var drive = hyperdrive(memdb())
var archive = drive.createArchive()

ln.link(archive, 'linkfile', <ARCHIVE KEY>, [meta], cb) // create symlink to another archive
ln.readlink(archive, 'linkfile', cb) // get linked archive key

// assume link(archive, 'path/to/file', <ARCHIVE KEY>)
ln.resolve(archive, 'path/to/file/within/linked/archive', cb) // returns (err, <ARCHIVE KEY>, 'within/linked/archive')

ln.encode(key) // encode a key for linkfile
ln.decode(data) // decode a linkfile content to key
```

## API

#### `ln.link(archive, path, archiveKey, [meta], cb)`

Create a symlink at `path` point to `archiveKey`.

You can pass a `meta` object to store it in the symlink.

#### `ln.readlink(archive, path, cb)`

Get the archiveKey stored inside a symlink

#### `ln.resolve(archive, path, cb)`

Resolve a path.

* If there's a symlink encountered in the path. `cb(err, archiveKey, restOfThePath)` will be invoked.
* If there's no symlink in the path, `cb(err, archive.key, '')` will be called.

#### `ln.encode(key)`

Encode a key to symlink file body.

#### `ln.decode(data)`

Decode a symlink file body to linked archive key.


## License

The MIT License
