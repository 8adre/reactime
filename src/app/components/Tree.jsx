import React from 'react';
import JSONTree from 'react-json-tree';

const getItemString = (type, data, itemType, itemString) => (
  <span>
    {/* //
    {type} */}
  </span>
);

const Tree = (props) => {
  const { snapshot } = props;
  console.log('TREE COMPONENT IS PRINTED');
  console.log(snapshot);
  return (
    <React.Fragment>
      {snapshot && (
        <JSONTree
          data={snapshot}
          theme={{ tree: () => ({ className: 'json-tree' }) }}
          shouldExpandNode={() => true}
          getItemString={getItemString}
          // labelRenderer={raw => <strong>{raw}</strong>}
          // valueRenderer={raw => <em>{raw}</em>}
        />
      )}
    </React.Fragment>
  );
};
export default Tree;
