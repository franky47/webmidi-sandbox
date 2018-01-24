import React from 'react'
import Midi from 'webmidi'
import MidiIOSelector from './MidiIOSelector'
import { sendDeviceIdentityRequest, attachListeners } from './engine'

export default class MidiSandbox extends React.Component {
  state = {
    enabled: false,
    error: null,
    inputs: [],
    outputs: []
  }

  componentDidMount () {
    const enableSysEx = true
    Midi.enable((error = null) => {
      Midi.addListener('connected', this._updateIO)
      Midi.addListener('disconnected', this._updateIO)
      this.setState({
        enabled: !error,
        error,
        inputs: Midi.inputs || [],
        outputs: Midi.outputs || []
      })
    }, enableSysEx)
  }

  _updateIO = () => {
    this.setState({
      inputs: Midi.inputs || [],
      outputs: Midi.outputs || []
    })
    Midi.inputs.map(attachListeners)
    Midi.outputs.map(sendDeviceIdentityRequest)
  }

  render () {
    return (
      <div>
        <p>{this.state.enabled && 'MIDI Engine Running'}</p>
        { this.state.error && <p>JSON.stringify(this.state.error)</p> }
        { this._renderInputSelector() }
        { this._renderOutputSelector() }
      </div>
    )
  }

  _renderInputSelector = () => {
    if (this.state.inputs.length === 0) {
      return null
    }
    return <MidiIOSelector name='Input' items={this.state.inputs} />
  }

  _renderOutputSelector = () => {
    if (this.state.outputs.length === 0) {
      return null
    }
    return <MidiIOSelector name='Output' items={this.state.outputs} />
  }
}
