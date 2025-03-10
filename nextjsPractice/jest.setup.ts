import '@testing-library/jest-dom';
import React, { ReactNode } from 'react';
import 'whatwg-fetch';
global.React = React;
// MEMO: @storybook/testing-react으로 globalSetup을 하고 있다면 불필요하다
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));
// https://github.com/scottrippey/next-router-mock/issues/58
jest.mock('next/dist/shared/lib/router-context.shared-runtime', () => {
  const { createContext } = require('react');
  const router = require('next-router-mock').default;
  const RouterContext = createContext(router);
  return { RouterContext };
});
jest.mock(
  'react-markdown',
  () =>
    ({ children }: { children: ReactNode }) =>
      children
);
