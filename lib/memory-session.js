var debug = require('debug')('telegraf-session-memory')

var db = {}

module.exports = function (opts) {
  opts = Object.assign({
    getSessionKey: function (event) {
      var chatId = 'global'
      if (event.chat) {
        chatId = event.chat.id
      }
      if (event.message && event.message.chat) {
        chatId = event.message.chat.id
      }
      return `${event.from.id}:v${chatId}`
    }
  }, opts)

  return function * (next) {
    var key = opts.getSessionKey(this.message || this.callbackQuery || this.inlineQuery || this.chosenInlineResult)
    if (!key) {
      return yield next
    }
    var session = {}
    this.__defineGetter__('session', function () {
      return session
    })
    this.__defineSetter__('session', function (val) {
      session = Object.assign({}, val)
    })
    debug('key %s', key)
    try {
      session = db[key] || {}
      yield next
    } catch (err) {
      throw err
    } finally {
      debug('save session', session)
      db[key] = session
    }
  }
}
