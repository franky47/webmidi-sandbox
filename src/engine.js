const stateMachine = {
  dirRequests: {},
  dirReplies: {}
}

export const attachListeners = (input) => {
  input.addListener('sysex', undefined, (event) => {
    stateMachine.dirReplies[input.id] = event
  })
}

export const sendDeviceIdentityRequest = (output) => {
  stateMachine.dirRequests[output.id] = new Date()
  output.sendSysex(0x7e, [0x7f, 0x06, 0x01])
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
