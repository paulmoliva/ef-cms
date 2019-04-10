import React from 'react';
import { connect } from '@cerebral/react';
import { state } from 'cerebral';

export const Text = connect(props => {
  const { get, bind, className } = props;

  let text;

  if (bind) {
    text = get(state[bind]);
  }

  if (!text) {
    return null;
  }

  return <span className={className}>{text}</span>;
});