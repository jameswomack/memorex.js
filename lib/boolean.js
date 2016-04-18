const debug = require('debug')('memorex.js')

function isOff (o) {
 return o === false   ||
        o === 'off'   ||
        o === 'false' ||
        o === 'no'    ||
        o === 'OFF'   ||
        o === 'FALSE' ||
        o === 'NO'    ||
        o instanceof Boolean && o.valueOf() === false
}

function isDefined (value) {
  return typeof value !== 'undefined'
}

function isOn (value) {
  return !isOff(value)
}

function areOn (values) {
  const isArray = Array.isArray(values)
  const isNotEmpty = values.length > 0
  debug('[Boolean.areOn] isArray: %s  isNotEmpty: %s, firstIsOn: %s', isArray, isNotEmpty, isOn(values[0]))

  if (isArray && isNotEmpty) return values.filter(isDefined).some(isOn)

  return true
}

module.exports = {
  isOff : isOff,
  isOn  : isOn,
  areOn : areOn
}
