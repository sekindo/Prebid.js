/**
 * example.js - analytics adapter for Example Analytics example
 */

import adapter from 'AnalyticsAdapter';

export default adapter(
  {
    global: 'ExampleAnalyticsGlobalObject',
    url: 'src/adapters/analytics/libraries/example.js',
    handler: 'on'
  }
);
