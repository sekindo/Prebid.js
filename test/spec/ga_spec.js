var assert = require('assert');
var ga = require('../../src/adapters/analytics/ga');

describe('Ga', function () {

  describe('enable', function () {

    it('should accept a tracker name option and output prefixed send string', function () {
      var config = { options: { trackerName: 'foo' } };
      ga.enable(config);

      var output = ga.getTrackerSend();
      assert.equal(output, 'foo.send');
    });

    it('should output normal send string when trackerName is not set', function () {
      var config = { options: {}};
      ga.enable(config);

      var output = ga.getTrackerSend();
      assert.equal(output, 'send');
    });

  });
});
