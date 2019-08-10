import React from 'react';
import PropTypes from 'prop-types';
import { diff, formatters } from 'jsondiffpatch';
import ReactHtmlParser from 'react-html-parser';

import { useStoreContext } from '../store';

function Diff({ snapshot, show }) {
  const [mainState] = useStoreContext();
  const { snapshots, viewIndex } = mainState;

  let previous;
  if (viewIndex === -1) {
    if (snapshots.length > 1) {
      previous = snapshots[snapshots.length - 2];
    } else {
      previous = undefined;
    }
  } else if (snapshots.length > 1) {
    previous = snapshots[viewIndex - 1];
  } else {
    [previous] = snapshots;
  }

  const delta = diff(previous, snapshot);
  const html = formatters.html.format(delta, previous);
  show ? formatters.html.showUnchanged() : formatters.html.hideUnchanged();

  return (
    previous ? <div> { ReactHtmlParser(html) } </div> : <div>states are equal</div>
  );
}

Diff.propTypes = {
  snapshot: PropTypes.shape({
    state: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  // show: PropTypes.boolean,
};

export default Diff;
