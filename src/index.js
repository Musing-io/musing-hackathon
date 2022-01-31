import 'isomorphic-fetch';
import React from 'react';
import { hydrate } from 'react-dom';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import app from './app';
import createStore from './app/store';
import ReactGA from 'react-ga';
import StyleContext from 'isomorphic-style-loader/StyleContext'
import { MoralisServerUrl, MoralisAppId } from "helpers/constants";
import { MoralisProvider } from "react-moralis";

require('./helpers/algolia'); // load algolia

ReactGA.initialize('UA-118128336-1');

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

let browserHistory;
if (__BROWSER__) {
  window.browserHistory = browserHistory = createBrowserHistory();
}

const store = createStore(preloadedState, browserHistory);

const App = app(store, browserHistory);
const insertCss = (...styles) => {
  const removeCss = styles.map(style => style._insertCss())
  return () => removeCss.forEach(dispose => dispose())
}

const render = Root => hydrate(
  <StyleContext.Provider value={{ insertCss }}>
    <MoralisProvider appId={MoralisAppId} serverUrl={MoralisServerUrl}>
      <Root>
        {(routes, history) => <ConnectedRouter history={history}>{routes}</ConnectedRouter>}
      </Root>
    </MoralisProvider>
  </StyleContext.Provider>,
  document.getElementById('root')
);

render(App);

if (module.hot) {
  module.hot.accept('./app', () => render(App.default));
}
