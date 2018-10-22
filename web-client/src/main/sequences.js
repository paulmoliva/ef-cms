import { set, toggle } from 'cerebral/factories';
import { state, props } from 'cerebral';
import * as actions from './actions';

export const getHello = [
  actions.getHello,
  set(state`response`, props.response),
];

export const toggleUsaBannerDetails = [toggle(state`usaBanner.showDetails`)];

export const gotoStyleGuide = [set(state`currentPage`, 'StyleGuide')];

export const gotoHome = [set(state`currentPage`, 'Home')];