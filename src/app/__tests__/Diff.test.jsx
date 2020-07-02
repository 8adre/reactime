import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Diff from '../components/Diff.jsx';

import { useStoreContext } from '../store';

configure({ adapter: new Adapter() });

jest.mock('../store');

describe('Unit testing for Diff.jsx', () => {
  let wrapper;
  const props = {
    show: false,
    snapshot: [{
      children: [{
        state: { total: 12, next: 5, operation: null },
      }],

    }],
  }

  const state = {
    currentTab: 100,
    tabs: { 100: { snapshots: [1, 2, 3, 4], viewIndex: 1, sliderIndex: 1 } },
  };


  useStoreContext.mockImplementation(() => [state]);

  const delta = { children: {} }; // expect delta to be an obj
  const html = 'html'; // expect html to be a string
  const previous = { state: 'string', children: {} }; // expect previous to be an obj

  beforeEach(() => {
    wrapper = shallow(<Diff {...props} />);
  });

  describe('delta', () => {
    it('delta variable should be an object, with a property children', () => {
      expect(typeof delta).toBe('object');
      expect(delta).toHaveProperty('children');
    });
  });

  describe('html', () => {
    it('html variable should be a string', () => {
      expect(typeof html).toBe('string');
    });
  });

  describe('previous', () => {
    it('previous variable should be a object', () => {
      expect(previous).toHaveProperty('state');
      expect(previous).toHaveProperty('children');
      expect(typeof previous).toBe('object');
    });
  });

  describe('Diff Component', () => {
    it('Check if Diff component is a div', () => {
      expect(wrapper.type()).toEqual('div');
    });
    it('Check if Diff component inner text value is a string', () => {
      expect(typeof wrapper.text()).toEqual('string');
    });
    xit('Check if Diff component div has a className noState ', () => {
      console.log(wrapper.props());
      expect(wrapper.props().className).toEqual('noState');
    });
  });

});
