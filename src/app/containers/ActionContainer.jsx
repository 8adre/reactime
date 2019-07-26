import React, { Component } from 'react';
import Action from '../components/Action';

class ActionContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      snapshots, snapshotIndex, handleChangeSnapshot, handleSendSnapshot,
    } = this.props;
    let actionsArr = [];
    if (snapshots.length > 0) {
      actionsArr = snapshots.map((snapshot, index) => {
        const selected = index === snapshotIndex;
        return (
          <Action
            key={`action${index}`}
            index={index}
            snapshot={snapshot}
            selected={selected}
            handleChangeSnapshot={handleChangeSnapshot}
            handleSendSnapshot={handleSendSnapshot}
          />
        );
      });
    }
    return (
      <div className="action-container">
        <button className="emptySnapshot" onClick = {this.props.emptySnapshot}>emptySnapshot</button>
        <div >{actionsArr}</div>
      </div>
    );

  }
}

export default ActionContainer;
