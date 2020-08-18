/* eslint-disable linebreak-style */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable linebreak-style */
/* eslint-disable no-inner-declarations, no-loop-func */
// eslint-disable-next-line import/newline-after-import
const acorn = require('acorn');
const jsx = require('acorn-jsx');
// import { acorn } from 'acorn'; // javascript parser
// import { jsx } from 'acorn-jsx';

const JSXParser = acorn.Parser.extend(jsx());

// Returns a throttled version of an input function
// The returned throttled function only executes at most once every t milliseconds
export const throttle = (f : Function, t: number) : Function => {
  let isOnCooldown : boolean = false;
  let isCallQueued : boolean = false;
  const throttledFunc = () : any => {
    if (isOnCooldown && isCallQueued) return;
    if (isOnCooldown) {
      isCallQueued = true;
      return;
    }
    f();
    isOnCooldown = true;
    isCallQueued = false;
    console.log(5);
    const runAfterTimeout = () : any => {
      if (isCallQueued) {
        isCallQueued = false;
        isOnCooldown = true; // not needed I think
        f();
        setTimeout(runAfterTimeout, t);
        return;
      }
      isOnCooldown = false;
    };
    setTimeout(runAfterTimeout, t);
  };
  return throttledFunc;
};

// Helper function to grab the getters/setters from `elementType`
export const getHooksNames = (elementType : string) : Array<string> => {
  // Initialize empty object to store the setters and getter
  let ast : any;
  try {
    ast = JSXParser.parse(elementType);
  } catch (e) {
    return ['unknown'];
  }

  // const hookState = {};
  // const hooksNames = {};
  const hookState: any = {};
  const hooksNames: any = {};

  while (Object.hasOwnProperty.call(ast, 'body')) {
    let tsCount : number = 0; // Counter for the number of TypeScript hooks seen (to distinguish in masterState)
    ast = ast.body;
    const statements : Array<any> = [];

    /** All module exports always start off as a single 'FunctionDeclaration' type
     * Other types: "BlockStatement" / "ExpressionStatement" / "ReturnStatement"
     * Iterate through AST of every function declaration
     * Check within each function declaration if there are hook declarations */
    ast.forEach((functionDec) => {
      let body : any;
      if (functionDec.expression && functionDec.expression.body)
        body = functionDec.expression.body.body;
      else body = functionDec.body ? functionDec.body.body : [];
      // Traverse through the function's funcDecs and Expression Statements
      body.forEach((elem : any) => {
        if (elem.type === 'VariableDeclaration') {
          elem.declarations.forEach((hook : any) => {
            // * TypeScript hooks appear to have no "VariableDeclarator"
            // * with id.name of _useState, _useState2, etc...
            // * hook.id.type relevant for TypeScript applications
            // *
            // * Works for useState hooks
            if (hook.id.type === 'ArrayPattern') {
              hook.id.elements.forEach((hook) => {
                statements.push(hook.name);
                // * Unshift a wildcard name to achieve similar functionality as before
                statements.unshift(`_useWildcard${tsCount}`);
                tsCount += 1;
              });
            } else {
              if (hook.init.object && hook.init.object.name) {
                const varName : any = hook.init.object.name;
                if (!hooksNames[varName] && varName.match(/_use/)) {
                  hooksNames[varName] = hook.id.name;
                }
              }
              if (hook.id.name !== undefined) {
                statements.push(hook.id.name);
              }
            }
          });
        }
      });

      statements.forEach((el, i) => {
        if (el.match(/_use/)) hookState[el] = statements[i + 2];
      });
    });
  }
  return Object.values(hooksNames);
};
