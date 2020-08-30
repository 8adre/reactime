/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import React, { useEffect } from 'react';
import HeadContainer from './HeadContainer';
import ActionContainer from './ActionContainer';
import StateContainer from './StateContainer';
import TravelContainer from './TravelContainer';
import ButtonsContainer from './ButtonsContainer';
import {
  addNewSnapshots, initialConnect, setPort, setTab, deleteTab,
} from '../actions/actions';
import { useStoreContext } from '../store';

import MPID from "../user_id/user_id";

const cookie = require("cookie");
const mixpanel = require("mixpanel").init("12fa2800ccbf44a5c36c37bc9776e4c0", {
  debug: true,
  protocol: "https"
});
console.log("MP ", Object.keys(mixpanel));

//attempt to read cookies
let user = new MPID();
let user_cookie = cookie.parse(document.cookie)?.reactime;
let d_id = () => user_cookie ? user_cookie.slice(0, 20) : null;
//set current user cookie if it does not exist in cookies;
if(!user_cookie) {
  console.log(" set cookie ");
  document.cookie = cookie.serialize( "reactime", user.setCookie() );
  console.log("DC ", document.cookie);
  user_cookie = user.getCookie();
  mixpanel.people.set(d_id(), {"times": 1})
}else{  
  console.log(" increment user visits ");
  mixpanel.people.increment(d_id(), "times");
}

function mpClickTrack(e) {
  console.log( "click event ", e.target, "cookie", user_cookie, "d_id ", d_id );
  mixpanel.track({ event: "click", {"$distinct_id": d_id } } );
}

document.addEventListener("click", mpClickTrack);


function MainContainer(): any {
  const [store, dispatch] = useStoreContext();
  const { tabs, currentTab, port: currentPort } = store;

  // add event listeners to background script
  useEffect(() => {
    // only open port once
    if (currentPort) return;
    // open connection with background script
    const port = chrome.runtime.connect();

    // listen for a message containing snapshots from the background script
    port.onMessage.addListener((message:{action:string, payload:Record<string, unknown>, sourceTab:number}) => {
      const { action, payload, sourceTab } = message;
      let maxTab;
      if (!sourceTab) {
        const tabsArray:any = Object.keys(payload);
        maxTab = Math.max(...tabsArray);
      }
      switch (action) {
        case 'deleteTab': {
          dispatch(deleteTab(payload));
          break;
        }
        case 'changeTab': {
          dispatch(setTab(payload));
          break;
        }
        case 'sendSnapshots': {
          dispatch(setTab(sourceTab));
          // set state with the information received from the background script
          dispatch(addNewSnapshots(payload));
          break;
        }
        case 'initialConnectSnapshots': {
          dispatch(setTab(maxTab));
          dispatch(initialConnect(payload));
          break;
        }
        default:
      }
      return true;
    });

    port.onDisconnect.addListener(() => {
      // disconnecting
    });

    // assign port to state so it could be used by other components
    dispatch(setPort(port));
  });

  if (!tabs[currentTab]) {
    return (
      <div className="error-container">
        <a
          href="reactime.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          No React application found. Please visit reactime.io to more info.
        </a>
      </div>
    );
  }
  const {
    viewIndex,
    sliderIndex,
    snapshots,
    hierarchy,
  } = tabs[currentTab];

  // if viewIndex is -1, then use the sliderIndex instead
  const snapshotView = viewIndex === -1 ? snapshots[sliderIndex] : snapshots[viewIndex];
  // cleaning hierarchy and snapshotView from stateless data
  const statelessCleaning = (obj:{name?:string; componentData?:object; state?:string|any;stateSnaphot?:object; children?:any[];}) => {
    const newObj = { ...obj };
    if (newObj.name === 'nameless') {
      delete newObj.name;
    }
    if (newObj.componentData) {
      delete newObj.componentData;
    }
    if (newObj.state === 'stateless') {
      delete newObj.state;
    }
    if (newObj.stateSnaphot) {
      newObj.stateSnaphot = statelessCleaning(obj.stateSnaphot);
    }
    if (newObj.children) {
      newObj.children = [];
      if (obj.children.length > 0) {
        obj.children.forEach((element:{state?:object|string, children?:[]}) => {
          if (element.state !== 'stateless' || element.children.length > 0) {
            const clean = statelessCleaning(element);
            newObj.children.push(clean);
          }
        });
      }
    }
    return newObj;
  };
  const snapshotDisplay = statelessCleaning(snapshotView);
  const hierarchyDisplay = statelessCleaning(hierarchy);
  return (
    <div className="main-container">
      <HeadContainer />
      <div className="body-container">
        <ActionContainer />
        {snapshots.length ? <StateContainer viewIndex={viewIndex} snapshot={snapshotDisplay} hierarchy={hierarchyDisplay} snapshots={snapshots} /> : null}
        <TravelContainer snapshotsLength={snapshots.length} />
        <ButtonsContainer />
      </div>
    </div>
  );
}

export default MainContainer;
