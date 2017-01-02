const tape = require('tape')
const memdb = require('memdb')
const hyperdrive = require('hyperdrive')
const Readable = require('stream').Readable
const swarm = require('hyperdiscovery')

const ln = require('..')

tape('deep resolve', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  var linkedArchive = drive.createArchive({live: false})
  write('bar').pipe(linkedArchive.createFileWriteStream('bar/baz.txt')).on('finish', test)

  function test () {
    linkedArchive.finalize(() => {
      ln.link(archive, '/foo/link', linkedArchive.key, err => {
        t.error(err)

        ln.deepResolve(drive, swarm, archive, '/foo/link/bar/baz.txt', (err, result) => {
          t.error(err)
          t.same(result.archive.key, archive.key)
          t.same(result.path, '/foo/link')
          t.ok(result.next)
          t.same(result.next.archive.key, linkedArchive.key)
          t.same(result.next.path, 'bar/baz.txt')
          t.notOk(result.next.next)
          ln.deepClose(result)
          t.end()
        })
      })
    })
  }
})

tape('deep resolve to file without link', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()
  write('baz').pipe(archive.createFileWriteStream('/foo/link')).on('finish', test)

  function test () {
    ln.deepResolve(drive, swarm, archive, '/foo/link', (err, result) => {
      t.error(err)
      t.same(result.archive.key, archive.key)
      t.same(result.path, '/foo/link')
      t.notOk(result.next)
      result.swarm.close()
      t.end()
    })
  }
})

tape('unresolvable not exists', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  ln.deepResolve(drive, swarm, archive, '/foo/link/bar/baz.txt', (err, result) => {
    t.same(err.message, 'unresolvable path /foo/link/bar/baz.txt')
    result.swarm.close()
    t.end()
  })
})

tape('unresolvable not link', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()

  write('baz').pipe(archive.createFileWriteStream('/foo/link')).on('finish', test)

  function test () {
    ln.deepResolve(drive, swarm, archive, '/foo/link/bar/baz.txt', (err, result) => {
      t.same(err.message, 'unresolvable at /foo/link')
      result.swarm.close()
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
