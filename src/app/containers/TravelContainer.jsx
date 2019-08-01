import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MainSlider from '../components/MainSlider';
import Dropdown from '../components/Dropdown';

const options = [
  { value: 2000, label: '0.5x' },
  { value: 1000, label: '1.0x' },
  { value: 500, label: '2.0x' },
];

class TravelContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedOption: options[1] };
    this.handleChangeSpeed = this.handleChangeSpeed.bind(this);
  }

  handleChangeSpeed(selectedOption) {
    this.setState({ selectedOption });
  }

  render() {
    const { selectedOption } = this.state;
    const {
      moveBackward,
      moveForward,
      snapshotsLength,
      handleJumpSnapshot,
      sliderIndex,
      play,
      playing,
      pause,
    } = this.props;

    return (
      <div className="travel-container">
        <div className="play-button" type="button" onClick={() => play(selectedOption.value)}>
          {playing ? 'Pause' : 'Play'}
        </div>
        <MainSlider
          snapshotLength={snapshotsLength}
          sliderIndex={sliderIndex}
          handleJumpSnapshot={handleJumpSnapshot}
          pause={pause}
        />
        <button className="backward-button" onClick={moveBackward} type="button">
          {'<'}
        </button>
        <button className="forward-button" onClick={moveForward} type="button">
          {'>'}
        </button>
        <Dropdown
          options={options}
          selectedOption={selectedOption}
          handleChangeSpeed={this.handleChangeSpeed}
        />
      </div>
    );
  }
}

TravelContainer.propTypes = {
  pause: PropTypes.func.isRequired,
  play: PropTypes.func.isRequired,
  moveBackward: PropTypes.func.isRequired,
  moveForward: PropTypes.func.isRequired,
  snapshotsLength: PropTypes.number.isRequired,
  handleJumpSnapshot: PropTypes.func.isRequired,
  sliderIndex: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
};
export default TravelContainer;
