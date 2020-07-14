import 'core-js';
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
// import * as reactWorkTags from './reactWorkTags';

const Flatted = require('flatted');
/**
 * @var copyInstances : Number of copies of Instances
 */
let copyInstances: number = 0;
const circularComponentTable = new Set<Tree> ();
/**
 * @function scrubUnserializableMembers : Removes unserializable state data such as functions
 */
// 
function scrubUnserializableMembers(tree: Tree): Tree {
  Object.entries(tree.state).forEach(keyValuePair => {
    if (typeof keyValuePair[1] === 'function') tree.state[keyValuePair[0]] = 'function';
  });
  return tree;
}

/**
 * 
 * This is the current snapshot that is being sent to the snapshots array.
 * 
 */
class Tree {
  /**
   * Create a Tree
   * @param state : the tree's current state
   * @param name : the tree's name
   * @param componentData : Data in the component tree
   * @param parent generates a new tree (recursive call)
   */
  state: string | {};
  name: string;
  componentData: {};
  children: (Tree | string)[] ;
  parent: Tree
  constructor(state : string | {}, name: string = 'nameless', componentData: {} = {}) {
    this.state = state === 'root' ? 'root' : JSON.parse(JSON.stringify(state));
    this.name = name;
    this.componentData = componentData ? JSON.parse(JSON.stringify(componentData)) : {};
    this.children = [];
    this.parent = null; // ref to parent so we can add siblings
  }
  /**
   * 
   * @function addChild : Pushes a new child tree in the children array
   * 
   */
  addChild(state: string | {} , name: string, componentData: {}): Tree {
    /**
     * @var newChild creates a new Child Tree
     */
    const newChild: Tree = new Tree(state, name, componentData);
    newChild.parent = this;
    this.children.push(newChild);
    return newChild;
  }
  /**
   * 
   * @function addSibling : Adds a sibing to the current tree
   * 
   */
  addSibling(state: string | {} , name: string, componentData: {}): Tree {
    /**
     * @var newSibling: creates a new Sibling Tree
     */
    const newSibling: Tree = new Tree(state, name, componentData);
    newSibling.parent = this.parent;
    this.parent.children.push(newSibling);
    return newSibling;
  }
  /**
   * @function cleanTreeCopy : Adds a sibing to the current tree
   */
  cleanTreeCopy(): Tree {
    /**
     * @object circularComponentTable : Clears circular component table only on first call, not recursive ones
     * @method clear clears component table
     */
    // 
    if (copyInstances === 0) {
      copyInstances++;
      circularComponentTable.clear();
    }
    // creates copy of present node
    let copy: Tree = new Tree(this.state, this.name, this.componentData);
    delete copy.parent;
    circularComponentTable.add(this);
    copy = scrubUnserializableMembers(copy);

    // copy.children = this.children;

    // creates copy of each child of the present node
    
    copy.children = this.children.map((child: Tree): Tree | string => {
        if (!circularComponentTable.has(child)) {
         return child.cleanTreeCopy();
        }
        return 'circular';
    });
    

    // returns copy
    copyInstances--;
    return copy;
  }
}

export default Tree;
