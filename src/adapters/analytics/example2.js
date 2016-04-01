/**
 * example2.js - analytics adapter for Example2 Analytics example
 */

import adapter from 'AnalyticsAdapter';
import utils from 'src/utils';

const global = 'ExampleAnalyticsGlobalObject2';
const url = 'src/adapters/analytics/libraries/example2.js';
const handler = 'send';

export default utils.extend(adapter(
  {
    global,
    url,
    handler
  }
),
  {
  track({ type, data }) {
    console.log('track function override for Example2 Analytics');
    window[global](handler, type, data);
  }
});
