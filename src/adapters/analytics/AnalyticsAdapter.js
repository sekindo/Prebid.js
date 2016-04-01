import events from 'src/events';
import utils from 'src/utils';
import CONSTANTS from 'src/constants.json';
import { loadScript } from 'src/adloader';

const BID_REQUESTED = CONSTANTS.EVENTS.BID_REQUESTED;
const BID_TIMEOUT = CONSTANTS.EVENTS.BID_TIMEOUT;
const BID_RESPONSE = CONSTANTS.EVENTS.BID_RESPONSE;
const BID_WON = CONSTANTS.EVENTS.BID_WON;

var _timedOutBidders = [];

export default function AnalyticsAdapter({ global, url, handler }) {
  var _queue = [];
  var _eventCount = 0;
  var _enableCheck = true;

  loadScript(url, _emptyQueue);

  return {
    track: _track,
    enqueue: _enqueue,
    enable: _enable
  };

  function _track({ type, data }) {
    window[global](handler, type, data);
  }

  function _enqueue({ type, data }) {
    const _this = this;

    if (global && window[global] && type && data && data.bidderCode) {
      this.track({ type, data });
    } else {
      _queue.push(function () {
        _eventCount++;
        _this.track({ type, data });
      });
    }
  }

  function _enable() {
    //first send all events fired before enableAnalytics called
    utils._each(events.getEvents(), event => {
      if (!event) {
        return;
      }

      const { type, args } = event;

      if (type === BID_TIMEOUT) {
        _timedOutBidders = args.bidderCode;
      } else {
        this.enqueue({ type, args });
      }
    });

    //Next register event listeners to send data immediately

    //bidRequests
    events.on(BID_REQUESTED, data => this.enqueue({ type: BID_REQUESTED, data }));
    events.on(BID_RESPONSE, data => this.enqueue({ type: BID_RESPONSE, data }));
    events.on(BID_TIMEOUT, data => this.enqueue({ type: BID_TIMEOUT, data }));
    events.on(BID_WON, data => this.enqueue({ type: BID_WON, data }));
  }

  function _emptyQueue() {
    if (_enableCheck && typeof window[global] === 'function') {
      for (var i = 0; i < _queue.length; i++) {
        _queue[i]();
      }

      //override push to execute the command immediately from now on
      _queue.push = function (fn) {
        fn();
      };

      //turn check into NOOP
      _enableCheck = false;
    }

    utils.logMessage(`event count sent to ${global}: ${_eventCount}`);
  }
}
