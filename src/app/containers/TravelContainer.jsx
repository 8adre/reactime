import React, { Component } from 'react';

import Slider from '../components/Slider';

class TravelContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="travel-container">TravelContainer</div>
        <Slider
          className="travel-slider"
          snapshotLength={this.props.snapshotsLength}
          handleChangeSnapshot={this.props.handleChangeSnapshot}
          handleJumpSnapshot={this.props.handleJumpSnapshot}
          snapshotIndex={this.props.snapshotIndex}
        />
        {`travelContainer snapshotIndex ${this.props.snapshotIndex}`}
      </div>
    );
  }
}
export default TravelContainer;
