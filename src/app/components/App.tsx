import React, { useReducer } from 'react';
import MainContainer from '../containers/MainContainer.tsx';
import { StoreContext } from '../store.tsx';
import mainReducer from '../reducers/mainReducer.tsx';

const initialState = {
  port: null,
  currentTab: null,
  tabs: {},
};

function App() {
  return (
    <StoreContext.Provider value={useReducer(mainReducer, initialState)}>
      <MainContainer />
    </StoreContext.Provider>
  );
}

export default App;