import React from 'react';
import { render } from 'react-dom';

import env from '../lib/enviroment';
import UKBridge from '../lib/uk-bridge';
import App from './App';

function main() {
  render(
    <App />,
    document.querySelector('#root')
  );
}

if (env.dev) {
  main();
} else {
  UKBridge.connectWebViewJavascriptBridge(main);
}
