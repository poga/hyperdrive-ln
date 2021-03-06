const collect = require('collect-stream')
const Readable = require('stream').Readable
const pump = require('pump')

module.exports = {readlink, link, resolve, encode, decode, deepResolve, deepClose}

function readlink (archive, entry, cb) {
  collect(archive.createFileReadStream(entry), (err, body) => {
    if (err) return cb(err, null)
    var link
    try {
      link = decode(body)
    } catch (e) {
      return cb(new Error('not a link'), null)
    }
    if (!link) return cb(new Error('not a link'), null)
    cb(null, link)
  })
}

function link (archive, entry, destArchiveKey, meta, cb) {
  if (typeof meta === 'function') {
    cb = meta
    meta = undefined
  }
  var s = new Readable()
  s.push(encode(destArchiveKey, meta))
  s.push(null)
  var w = archive.createFileWriteStream(entry)
  pump(s, w, cb)
}

function resolve (archive, path, cb) {
  var components = path.split('/')
  var partialPath = []
  var found = false
  archive.list((err, entries) => {
    if (err) return cb(err)
    for (var i = 0; i < components.length; i++) {
      var c = components[i]
      partialPath.push(c)

      if (exist(entries, partialPath)) {
        readlink(archive, partialPath.join('/'), (err, link) => {
          if (err && err.message === 'not a link') {
            if (i === components.length - 1) {
              // found the file
              return cb(null, {}, partialPath.join('/'))
            }
            return cb(new Error(`unresolvable at ${partialPath.join('/')}`))
          }
          if (err) return cb(err)

          return cb(null, link, components.slice(i + 1).join('/'))
        })
        found = true
        break
      }
    }

    if (!found) {
      cb(new Error(`unresolvable path ${path}`))
    }
  })

  function exist (entries, partialPath) {
    if (entries.find(x => x.name === partialPath.join('/'))) return true

    return false
  }
}

function deepResolve (drive, swarmer, archive, path, cb) {
  _resolve(archive, path, cb)

  function _resolve (archive, path, cb) {
    var swarm = swarmer(archive)
    resolve(archive, path, (err, linkInfo, nextPath) => {
      // must return result: swarm need to be closed
      var result = {archive, path, swarm}
      if (err) {
        return cb(err, result)
      }
      if (nextPath === path) return cb(null, result)

      var nextArchive = drive.createArchive(linkInfo.link, {sparse: true})

      _resolve(nextArchive, nextPath, (err, resolved) => {
        cb(err, {
          archive,
          swarm,
          path: path.replace(new RegExp(`\/${nextPath.replace('/', '\/')}$`), ''), // eslint-disable-line no-useless-escape
          next: resolved
        })
      })
    })
  }
}

function deepClose (deepResolveResult) {
  if (!(deepResolveResult && deepResolveResult.swarm)) return

  deepResolveResult.swarm.close()
  deepClose(deepResolveResult.next)
}

function encode (destKey, meta) {
  if (destKey instanceof Buffer) return encode(destKey.toString('hex'), meta)
  var body = {'$$hdln$$': destKey}
  if (meta) body.meta = meta
  return JSON.stringify(body)
}

function decode (b) {
  var data = JSON.parse(b)
  var link = JSON.parse(b)['$$hdln$$']
  if (!link) throw new Error('not a link')
  return {link: link, meta: data.meta}
}
