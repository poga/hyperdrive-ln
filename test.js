const tape = require('tape')
const memdb = require('memdb')
const hyperdrive = require('hyperdrive')

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
