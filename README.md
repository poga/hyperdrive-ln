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

// assume ln.link(archive, 'path/to/file', <ARCHIVE KEY>)
ln.resolve(archive, 'path/to/file/within/linked/archive', cb) // returns (err, <ARCHIVE KEY>, 'within/linked/archive')

// resolve through archives
ln.deepResolve(drive, swarmer, archive, path, cb)

ln.encode(key, [meta]) // encode a key for linkfile
ln.decode(data) // decode a linkfile content to key
```

## API

#### `ln.link(archive, path, archiveKey, [meta], cb)`

Create a symlink at `path` point to `archiveKey`.

You can pass a `meta` object to store it in the symlink.

#### `ln.readlink(archive, path, cb)`

Get the archiveKey stored inside a symlink

#### `ln.resolve(archive, path, cb)`

Resolve a path. Returns an archive and a path within that archive with `cb(err, linkedArchiveKey, pathWithinLinkedArchive)`

* If there's a symlink encountered in the path. `cb(err, linkKey, pathWithinLinkedArchive)` will be invoked.
* If there's no symlink in the path, `cb(err, archive.key, path)` will be called.

for example:

```js
ln.link(archive, 'foo/bar', '<LINK_KEY>', (err) => {
    ln.resolve(archive, 'foo/bar/baz', (err, link, path) => {
      // link === '<LINK_KEY>'
      // path === 'baz'
    })
})
```

#### `ln.deepResolve(drive, swarmer, archive, path, cb)`

Recursively resolve a path through archives. Create swarm connection when necessary.

`swarmer` is anything let you join swarm . For example: [hyperdiscovery](https://github.com/karissa/hyperdiscovery).

callback `cb(err, result)`. `result` is a recursive structure:
```js
{
  archive: // traversed archive,
  path: // consumed path,
  swarm: // swarm instance,
  next: result // next component if there's one
}
```

For example: Assume we have an `archive1` which `/foo/bar` linked to `archive2`.

```js
ln.deepResolve(drive, swarmer, archive1, '/foo/bar/baz/baz.txt', cb)
```

will get the result:

```js
{
  archive: archive1,
  path: '/foo/bar',
  swarm: // a swarm instance,
  next: {
    archive: archive2,
    path: 'baz/baz.txt',
    swarm: // another swarm instance
  }
}
```
use `deepClose(result)` to close all swarm instance in the result.

#### `ln.deepClose(result)`

Close all swarm instance in the result.

#### `body = ln.encode(key, [meta])`

Encode a key to symlink file body.

#### `ln.decode(body)`

Decode a symlink file body to linked archive key.

## License

The MIT License
