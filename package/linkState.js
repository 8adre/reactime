// links component state to library
// changes the setState method to also update our snapshot

module.exports = (snapShot, mode) => {
  // send message to window containing component states
  // unless library is currently jumping through time
  function sendSnapShot() {
    if (mode.jumping) return;
    const payload = snapShot.map(({ component }) => component.state);
    window.postMessage({
      action: 'recordSnap',
      payload,
    });
  }

  function changeSetState(component) {
    // make a copy of setState
    const oldSetState = component.setState.bind(component);

    let first = true;
    function newSetState(state, callback = () => { }) {
      // if setState is being called for the first time, this conditional sends the initial snapshot
      if (first) {
        first = false;
        sendSnapShot();
      }

      // continue normal setState functionality, except add sending message middleware
      oldSetState(state, () => {
        sendSnapShot();
        callback();
      });
    }

    // convert setState to promise
    const setStateAsync = (state) => {
      return new Promise(resolve => oldSetState(state, resolve));
    };

    // add component to snapshot
    snapShot.push({ component, setStateAsync });

    // replace component's setState so developer doesn't change syntax
    component.setState = newSetState;
  }

  function changeComponentWillUnmount(component) {
    component.componentWillUnmount = () => {
      let snapShotIndex = snapShot.length;
      for (let i = 0; i < snapShot.length; i += 1) {
        const { component: comp } = snapShot[i];
        if (component === comp) {
          snapShotIndex = i;
        }
      }
      snapShot.splice(snapShotIndex, 1);
    };
  }


  return (component) => {
    changeSetState(component);
    changeComponentWillUnmount(component);
  };
};
