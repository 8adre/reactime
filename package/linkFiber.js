// links component state tree to library
// changes the setState method to also update our snapshot
const Tree = require('./tree');

module.exports = (snap, mode) => {
  let fiberRoot = null;

  function changeSetState(component) {
    // check that setState hasn't been changed yet
    if (component.setState.name === 'newSetState') return;

    // make a copy of setState
    const oldSetState = component.setState.bind(component);

    function newSetState(state, callback = () => { }) {
      // continue normal setState functionality, except add sending message middleware
      oldSetState(state, () => {
        updateSnapShotTree();
        callback();
      });
    }

    // replace component's setState so developer doesn't change syntax
    component.setState = newSetState;
  }

  function createTree(currentFiber, tree = new Tree('root')) {
    if (!currentFiber) return tree;

    const { sibling, stateNode, child } = currentFiber;

    let nextTree = tree;
    if (stateNode && stateNode.state) {
      nextTree = tree.appendChild(stateNode);
      changeSetState(stateNode);
    }

    // iterate through siblings
    createTree(sibling, tree);
    // iterate through children
    createTree(child, nextTree);

    return tree;
  }

  // mutates origin tree and merges it with target
  function mergeTrees(origin, target) {
    target.children.forEach((child, i) => {
      // check if child exists in origin tree
      if (!origin.children[i]) {
        origin.children.push(child);
      } else {
        mergeTrees(origin.children[i], child);
      }
    });
    // remove any unnecessary children
    origin.children.splice(target.children.length);
  }

  function updateSnapShotTree() {
    const { current } = fiberRoot;
    const curr = createTree(current);
    mergeTrees(snap.tree, curr);
  }
  return (container) => {
    fiberRoot = container._reactRootContainer._internalRoot;
    snap.tree = createTree(fiberRoot.current);
  };
};
