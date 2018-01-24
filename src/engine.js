import Midi from 'webmidi'

const devices = {}

export const findDevice = (callback) => (output) => {
  const input = Midi.getInputByName(output.name) || null
  if (input) {
    const key = `${input.name}|${output.name}`
    if (devices.hasOwnProperty(key)) {
      return // Don't send again
    }
    console.log('Found matching input:', key)
    devices[key] = false
    console.log(devices)
    input.addListener('sysex', undefined, (event) => {
      console.log('Received data from ', input.name, event)
      if (isValidDevice(event.data)) {
        console.log('Found device')
        input.removeListener('sysex')
        devices[key] = true
        callback(input, output)
      }
    })
    console.log('Sending sysex to', output.name)
    output.sendSysex(0x7e, [0x7f, 0x06, 0x01])
  }
}

export const parseDeviceIdentityReply = (data) => {
  // Format: F0 7E id 06 02 mm ff ff dd dd ss ss ss ss F7
  if (data.shift() !== 0xf0) return false
  if (data.shift() !== 0x7e) return false
  const deviceId = data.shift()
  if (data.shift() !== 0x06) return false
  if (data.shift() !== 0x02) return false
  let manufacturerId = [data.shift()]
  if (manufacturerId[0] === 0x00) {
    manufacturerId.push(data.shift())
    manufacturerId.push(data.shift())
  } else {
    manufacturerId = manufacturerId[0]
  }
  const deviceFamilyCode = [data.shift(), data.shift()]
  const deviceFamilyMemberCode = [data.shift(), data.shift()]
  const softwareRevision = [data.shift(), data.shift(), data.shift(), data.shift()]
  return {
    deviceId,
    manufacturerId,
    deviceFamilyCode,
    deviceFamilyMemberCode,
    softwareRevision
  }
}

export const isValidDevice = (data) => {
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

  const info = parseDeviceIdentityReply(Array.from(data))
  console.log(info)
  // Manufacturer: Arturia
  if (!eq(info.manufacturerId, [0x00, 0x20, 0x6b])) return false
  console.log('Arturia, check')
  // Device: MiniBrute
  if (!eq(info.deviceFamilyCode, [0x04, 0x00])) return false
  if (!eq(info.deviceFamilyMemberCode, [0x01, 0x01])) return false
  console.log('MiniBrute, check')
  const version = info.softwareRevision.join('.')
  return version >= '1.0.3.2'
}
