/**
 * This file contains core module functionality.
 *
 * It exports an anonymous
 * @function
 * that is invoked on
 * @param snap --> Current snapshot
 * @param mode --> Current mode (jumping i.e. time-traveling, locked, or paused)
 * and @returns a function to be invoked on the rootContainer HTMLElement
 *
 * @function updateSnapShotTree
 * --> Middleware #1: Updates snap object with latest snapshot
 *
 * @function sendSnapshot
 * --> Middleware #2: Gets a copy of the current snap.tree and posts a message to the window
 *
 * @function changeSetState
 * @param component : stateNode property on a stateful class component's FiberNode object
 * --> Binds class component setState method to the component
 * --> Injects middleware into class component's setState method
 *
 * @function changeUseState
 * @param component : memoizedState property on a stateful functional component's FiberNode object
 * --> Binds functional component dispatch method to the component
 * --> Injects middleware into component's dispatch method
 * Note: dispatch is hook equivalent to setState()
 *
 * @function traverseHooks
 * @param memoizedState : memoizedState property on a stateful fctnl component's FiberNode object
 * --> Helper function to traverse through memoizedState
 * --> Invokes @changeUseState on each stateful functional component
 *
 * @function createTree
 * @param currentFiber : a FiberNode object
 * --> Recursive function to traverse from FiberRootNode and create
 *     an instance of custom Tree class and build up state snapshot
 */

/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */

const Tree = require('./tree');
const componentActionsRecord = require('./masterState');

module.exports = (snap, mode) => {
  let fiberRoot = null;

  async function sendSnapshot() {
    // Don't send messages while jumping or while paused
    if (mode.jumping || mode.paused) return;
    console.log('PAYLOAD: before cleaning', snap.tree);
    const payload = snap.tree.cleanTreeCopy();// snap.tree.getCopy();
    console.log('PAYLOAD: after cleaning', payload);
    try {
      await window.postMessage({
        action: 'recordSnap',
        payload,
      });
    } catch (e) {
      console.log('failed to send postMessage:', e);
    }
  }

  // Carlos: Injects instrumentation to update our state tree every time
  // a hooks component changes state
  function traverseHooks(memoizedState) {
    const hooksStates = [];
    while (memoizedState && memoizedState.queue) {
      // Carlos: these two are legacy comments, we should look into them later
      // prevents useEffect from crashing on load
      // if (memoizedState.next.queue === null) { // prevents double pushing snapshot updates
      if (memoizedState.memoizedState) {
        console.log('memoizedState in traverseHooks is:', memoizedState);
        hooksStates.push({
          component: memoizedState.queue,
          state: memoizedState.memoizedState,
        });
      }
      // console.log('GOT STATE', memoizedState.memoizedState);
      memoizedState = memoizedState.next !== memoizedState
        ? memoizedState.next : null;
    }
    return hooksStates;
  }

  // Carlos: This runs after EVERY Fiber commit. It creates a new snapshot,
  //
  function createTree(currentFiber, tree = new Tree('root')) {
    // Base case: child or sibling pointed to null
    if (!currentFiber) return null;
    if (!tree) return tree;

    // These have the newest state. We update state and then
    // called updateSnapshotTree()
    const {
      sibling,
      stateNode,
      child,
      memoizedState,
      elementType,
      tag,
      actualDuration,
      actualStartTime,
      selfBaseDuration,
      treeBaseDuration,
    } = currentFiber;

    let newState = null;
    let componentData = {};
    let componentFound = false;

    // Check if node is a stateful setState component
    if (stateNode && stateNode.state && (tag === 0 || tag === 1)) {
      // Save component's state and setState() function to our record for future
      // time-travel state changing. Add record index to snapshot so we can retrieve.
      componentData.index = componentActionsRecord.saveNew(stateNode.state, stateNode);
      newState = {state: stateNode.state};
      componentFound = true;
    }

    // Check if node is a hooks useState function
    let hooksIndex;
    if (memoizedState && (tag === 0 || tag === 1 || tag === 10)) {
      if (memoizedState.queue) {
        // Hooks states are stored as a linked list using memoizedState.next,
        // so we must traverse through the list and get the states.
        // We then store them along with the corresponding memoizedState.queue,
        // which includes the dispatch() function we use to change their state.
        const hooksStates = traverseHooks(memoizedState);
        hooksStates.forEach(state => {
          hooksIndex = componentActionsRecord.saveNew(state.state, state.component);
          if (newState && newState.hooksState) {
            newState.hooksState.push([state.state, hooksIndex]);
          } else if (newState) {
            newState.hooksState = [[state.state, hooksIndex]];
          } else {
            newState = { hooksState: [[state.state, hooksIndex]] };
          }
          componentFound = true;
        });
      }
    }

    // This grabs stateless components
    if (!componentFound && (tag === 0 || tag === 1)) {
      newState = 'stateless';
    }

    // Adds performance metrics to the component data
    componentData = {
      ...componentData,
      actualDuration,
      actualStartTime,
      selfBaseDuration,
      treeBaseDuration,
    };

    if (componentFound) {
      tree.addChild(newState, elementType.name ? elementType.name : elementType, componentData);
    } else if (newState === 'stateless') {
      tree.addChild(newState, elementType.name ? elementType.name : elementType, componentData);
    }

    // Recurse on children
    if (child) {
      // If this node had state we appended to the children array,
      // so attach children to the newly appended child.
      // Otherwise, attach children to this same node.
      if (tree.children.length > 0) {
        createTree(child, tree.children[tree.children.length - 1]);
      } else {
        createTree(child, tree);
      }
    }
    // Recurse on siblings
    if (sibling) createTree(sibling, tree);

    return tree;
  }

  // ! BUG: skips 1st hook click
  function updateSnapShotTree() {
    const { current } = fiberRoot;
    snap.tree = createTree(current);
  }

  return async container => {
    // Point fiberRoot to FiberRootNode
    if (container._internalRoot) {
      fiberRoot = container._internalRoot;
    } else {
      const {
        _reactRootContainer: { _internalRoot },
        _reactRootContainer,
      } = container;
      // Only assign internal root if it actually exists
      fiberRoot = _internalRoot || _reactRootContainer;
    }
    const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    const reactInstance = devTools ? devTools.renderers.get(1) : null;

    if (reactInstance && reactInstance.version) {
      devTools.onCommitFiberRoot = (function (original) {
        return function (...args) {
          fiberRoot = args[1];
          updateSnapShotTree();
          sendSnapshot();
          return original(...args);
        };
      }(devTools.onCommitFiberRoot));
    }
    updateSnapShotTree();
    // Send the initial snapshot once the content script has started up
    // This message is sent from contentScript.js in chrome extension bundles
    window.addEventListener('message', ({ data: { action } }) => {
      if (action === 'contentScriptStarted') {
        sendSnapshot();
      }
    });
  };
};
