import React from "react";
import PropTypes from "prop-types";
import { diff, formatters } from "jsondiffpatch";
import ReactHtmlParser from "react-html-parser";

import { useStoreContext } from "../store";

function Diff({ snapshot, show }) {
  const [mainState] = useStoreContext();
  const { currentTab, tabs } = mainState; //k/v pairs of mainstate store object being created
  console.log(mainState);
  const { snapshots, viewIndex, sliderIndex } = tabs[currentTab];
  let previous;

  // previous follows viewIndex or sliderIndex
  if (viewIndex !== -1) {
    previous = snapshots[viewIndex - 1];
  } else {
    previous = snapshots[sliderIndex - 1];
  }
  //diff function is supposed to return two of the same objects side by side
  const delta = diff(previous, snapshot);
  console.log("this is the result of running diff function   ", delta);
  // returns html in string
  const html = formatters.html.format(delta, previous);
  if (show) formatters.html.showUnchanged();
  else formatters.html.hideUnchanged();

  if (previous === undefined || delta === undefined)
    return (
      <div> No state change detected. Trigger an event to change state </div>
    );
  return <div>{ReactHtmlParser(html)}</div>;
}

Diff.propTypes = {
  snapshot: PropTypes.shape({
    state: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  show: PropTypes.bool.isRequired,
};

export default Diff;
