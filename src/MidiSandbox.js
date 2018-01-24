import React from 'react'
import Midi from 'webmidi'
import MidiIOSelector from './MidiIOSelector'
import { findDevice } from './engine'

export default class MidiSandbox extends React.Component {
  state = {
    enabled: false,
    error: null,
    inputs: [],
    outputs: [],
    miniBruteOut: null,
    miniBruteIn: null
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
    Midi.outputs.map(findDevice(this._deviceFound))
  }
  _deviceFound = (input, output) => {
    this.setState({
      miniBruteOut: output,
      miniBruteIn: input
    })
  }

  render () {
    return (
      <div>
        <p>{this.state.enabled && 'MIDI Engine Running'}</p>
        { this.state.error && <p>JSON.stringify(this.state.error)</p> }
        { this._renderInputSelector() }
        { this._renderOutputSelector() }
        { this.state.miniBruteIn && <p>MiniBrute In: {this.state.miniBruteIn.name}</p> }
        { this.state.miniBruteOut && <p>MiniBrute Out: {this.state.miniBruteOut.name}</p> }
        <button onClick={this._convertToSe}>Convert to MiniBrute SE</button>
        <button onClick={this._convertToVanilla}>Convert to MiniBrute</button>
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
  _convertToSe = () => {
    if (this.state.miniBruteOut === null) {
      return
    }
    this.state.miniBruteOut.sendSysex([0x00, 0x20, 0x6B], [0x04, 0x01, 0x75, 0x01, 0x3E, 0x01])
  }
  _convertToVanilla = () => {
    if (this.state.miniBruteOut === null) {
      return
    }
    this.state.miniBruteOut.sendSysex([0x00, 0x20, 0x6B], [0x04, 0x01, 0x46, 0x01, 0x3E, 0x00])
  }
}
