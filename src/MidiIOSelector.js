import React from 'react'

export default class MidiIOSelector extends React.PureComponent {
  render () {
    return (
      <label >
        {this.props.name}
        <select name={this.props.name}>
          { this.props.items.map(this._renderItem)}
        </select>
      </label>
    )
  }
  _renderItem = (item) => (
    <option value={item.id} key={item.id}>
      {item.name}
    </option>
  )
}
