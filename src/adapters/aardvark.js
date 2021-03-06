var utils = require('../utils.js');
var bidfactory = require('../bidfactory.js');
var bidmanager = require('../bidmanager.js');
var adloader = require('../adloader');


/**
 * Adapter for requesting bids from RTK Aardvark
 * To request an RTK Aardvark Header bidding account
 * or for additional integration support please contact sales@rtk.io
 */

var AardvarkAdapter = function AardvarkAdapter() {

  function _callBids(params) {
    var rtkBids = params.bids || [];

    _requestBids(rtkBids);
  }

  function _requestBids(bidReqs) {
    let ref;
    try {
      ref = window.top.location.host;
    }
    catch (err) {
      ref = "thor.rtk.io";

    }
    var ai = "";
    var shortcodes = [];

    //build bid URL for RTK
    utils._each(bidReqs, function (bid) {
      ai = utils.getBidIdParamater('ai', bid.params);
      var sc = utils.getBidIdParamater('sc', bid.params);
      shortcodes.push(sc);
    });

    var scURL = "";

    if (shortcodes.length > 1) {
      scURL = shortcodes.join("_");
    } else {
      scURL = shortcodes[0];
    }

    var scriptUrl = '//thor.rtk.io/' + ai + "/" + scURL + "/aardvark/?jsonp=window.$$PREBID_GLOBAL$$.aardvarkResponse&rtkreferer=" + ref;
    adloader.loadScript(scriptUrl);
  }

  //expose the callback to the global object:
  window.$$PREBID_GLOBAL$$.aardvarkResponse = function (rtkResponseObj) {

    //Get all initial Aardvark Bid Objects
    var bidsObj = $$PREBID_GLOBAL$$._bidsRequested.filter(function (bidder) {
      return bidder.bidderCode === 'aardvark';
    })[0];

    var returnedBidIDs = {};

    if (rtkResponseObj.length > 0) {
      rtkResponseObj.forEach(function (bid) {

        if (!bid.error) {
          var currentBid = bidsObj.bids.filter(function (r) {
            return r.params.sc === bid.id;
          })[0];
          if (currentBid) {
            var bidResponse = bidfactory.createBid(1, currentBid);
            bidResponse.bidderCode = "aardvark";
            bidResponse.cpm = bid.cpm;
            bidResponse.ad = bid.adm;
            bidResponse.ad += utils.createTrackPixelHtml(decodeURIComponent(bid.nurl));
            bidResponse.width = currentBid.sizes[0][0];
            bidResponse.height = currentBid.sizes[0][1];
            returnedBidIDs[bid.id] = currentBid.placementCode;
            bidmanager.addBidResponse(currentBid.placementCode, bidResponse);
          }

        }

      });

    }

    //All bids are back - lets add a bid response for anything that did not receive a bid.
    let difference = bidsObj.bids.filter(x => Object.keys(returnedBidIDs).indexOf(x.params.sc) === -1);

    difference.forEach(function (bidRequest) {
      var bidResponse = bidfactory.createBid(2, bidRequest);
      bidResponse.bidderCode = "aardvark";
      bidmanager.addBidResponse(bidRequest.placementCode, bidResponse);
    });


  }; // aardvarkResponse

  return {
    callBids: _callBids
  };
};

module.exports = AardvarkAdapter;
