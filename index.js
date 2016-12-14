const collect = require('stream-collect')
const Readable = require('stream').Readable

module.exports = {read, readlink, link}

function readlink (archive, entry, cb) {
  collect(archive.createFileReadStream(entry), body => {
    try {
      var l = decode(body)
      if (!l) return cb(new Error('no link found'))
      cb(null, l)
    } catch (e) {
      cb(e)
    }
  })
}

function read (drive, archive, entry, cb) {
  readlink(archive, entry, (err, info) => {
    if (err) return cb(err)
    cb(null, drive.createArchive(info))
  })
}

function link (archive, entry, destArchiveKey, cb) {
  var s = new Readable()
  s.push(encode(destArchiveKey))
  s.push(null)
  var w = archive.createFileWriteStream(entry)
  s.pipe(w).on('finish', cb)
}

function encode (destKey) {
  return JSON.stringify({l: destKey})
}

function decode (b) {
  return JSON.parse(b).l
}
