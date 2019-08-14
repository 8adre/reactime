import React from 'react';
import PropTypes from 'prop-types';
import { diff, formatters } from 'jsondiffpatch';
import ReactHtmlParser from 'react-html-parser';

import { useStoreContext } from '../store';

function Diff({ snapshot, show }) {
  const [mainState] = useStoreContext();
  const { currentTab, tabs } = mainState;
  const { snapshots, viewIndex, sliderIndex } = tabs[currentTab];
  let previous;

  // previous follows viewIndex or sliderIndex
  if (viewIndex !== -1) {
    previous = snapshots[viewIndex - 1];
  } else {
    previous = snapshots[sliderIndex - 1];
  }

  const delta = diff(previous, snapshot);
  // returns html in string
  const html = formatters.html.format(delta, previous);
  if (show) formatters.html.showUnchanged();
  else formatters.html.hideUnchanged();

  if (previous === undefined || delta === undefined) return <div> states are equal </div>;
  return (
    <div>
      { ReactHtmlParser(html) }
    </div>
  );
}

Diff.propTypes = {
  snapshot: PropTypes.shape({
    state: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  show: PropTypes.bool.isRequired,
};

export default Diff;
