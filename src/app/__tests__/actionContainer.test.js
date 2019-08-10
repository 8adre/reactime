/* eslint-disable react/jsx-filename-extension */

import { shallow, mount, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import ActionContainer from '../containers/ActionContainer';
import { useStoreContext } from '../store';
import { emptySnapshots } from '../actions/actions';
import Action from '../components/Action';

configure({ adapter: new Adapter() });

const state = {
  tabs: {
    87: {
      snapshots: [1, 2, 3, 4],
      sliderIndex: 0,
      viewIndex: -1,
    },
  },
  currentTab: 87,
};

const dispatch = jest.fn();

jest.mock('../store');
useStoreContext.mockImplementation(() => [state, dispatch]);

let wrapper;

beforeEach(() => {
  wrapper = shallow(<ActionContainer />);
  useStoreContext.mockClear();
  dispatch.mockClear();
});

describe('testing the emptySnapshot button', () => {
  test('emptySnapshot button should dispatch action upon click', () => {
    wrapper.find('.empty-button').simulate('click');
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test('emptying snapshots should send emptySnapshot action to dispatch', () => {
    wrapper.find('.empty-button').simulate('click');
    expect(dispatch.mock.calls[0][0]).toEqual(emptySnapshots());
  });
});

test('number of actions should reflect snapshots array', () => {
  expect(wrapper.find(Action).length).toBe(state.tabs[state.currentTab].snapshots.length);
});
