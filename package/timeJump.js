module.exports = (snapShot, mode) => {
  return (newSnapShot) => {
    mode.jumping = true;
    newSnapShot.forEach(async (state, i) => {
      await snapShot[i].setStateAsync(state);
    });
    mode.jumping = false;
  };
};
