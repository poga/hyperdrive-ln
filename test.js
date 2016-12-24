const tape = require('tape')
const memdb = require('memdb')
const hyperdrive = require('hyperdrive')
const Readable = require('stream').Readable
const collect = require('collect-stream')

const ln = require('.')

tape('link', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  ln.link(archive, 'symlink', 'foo', () => {
    archive.list((err, entries) => {
      t.error(err)
      t.same(entries[0].name, 'symlink')

      ln.readlink(archive, entries[0], (err, info) => {
        t.error(err)
        t.same(info, 'foo')
        t.end()
      })
    })
  })
})

tape('link with metadata', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  ln.link(archive, 'symlink', 'foo', {bar: 'baz'}, () => {
    archive.list((err, entries) => {
      t.error(err)
      t.same(entries[0].name, 'symlink')

      ln.readlink(archive, entries[0], (err, key) => {
        t.error(err)
        t.same(key, 'foo')

        collect(archive.createFileReadStream(entries[0]), (err, data) => {
          t.error(err)
          t.same(JSON.parse(data), {'$$hdln$$': 'foo', meta: {bar: 'baz'}})
          t.end()
        })
      })
    })
  })
})

tape('resolve', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  var linkedArchive = drive.createArchive({live: false})
  linkedArchive.finalize(() => {
    ln.link(archive, '/foo/link', linkedArchive.key, err => {
      t.error(err)

      ln.resolve(archive, '/foo/link/bar/baz.txt', (err, link, nextPath) => {
        t.error(err)
        t.same(link, linkedArchive.key.toString('hex'))
        t.same(nextPath, 'bar/baz.txt')
        t.end()
      })
    })
  })
})

tape('resolve to file without link', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()
  write('baz').pipe(archive.createFileWriteStream('/foo/link')).on('finish', test)

  function test () {
    ln.resolve(archive, '/foo/link', (err, link, nextPath) => {
      t.error(err)
      t.same(link, archive.key)
      t.same(nextPath, '')
      t.end()
    })
  }
})

tape('unresolvable not exists', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  ln.resolve(archive, '/foo/link/bar/baz.txt', (err, link, nextPath) => {
    t.same(err.message, 'unresolvable path /foo/link/bar/baz.txt')
    t.end()
  })
})

tape('unresolvable not link', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  write('baz').pipe(archive.createFileWriteStream('/foo/link')).on('finish', test)

  function test () {
    ln.resolve(archive, '/foo/link/bar/baz.txt', (err, link, nextPath) => {
      t.same(err.message, 'unresolvable at /foo/link')
      t.end()
    })
  }
})

function write (str) {
  var s = new Readable()
  s.push(str)
  s.push(null)
  return s
}
