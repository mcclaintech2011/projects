var TracksterTests = {};

TracksterTests.runAllTracksterTests = function() {
  var errors = [];
  TracksterTests.testSearchTracksByTitle(errors);
  TracksterTests.testRenderTracks(errors);
  TracksterTests.logErrors(errors);
};

TracksterTests.testRenderTracks = function(errors) {
  var hasRenderTracks = Trackster.renderTracks && typeof Trackster.renderTracks === 'function';
  if (!hasRenderTracks) {
    errors.push("renderTracks: Trackster object should have a function called renderTracks.");
    // If renderTracks method is missing, remaining tests will not work.
    return;
  }

  var userHtml = $('body').html();

  var tinyDancerTracks = [{
    url: 'https://www.last.fm/music/Elton+John/_/Tiny+Dancer',
    name: 'Tiny Dancer',
    artist: 'Elton John',
    image: [
      {},
      {
        '#text': 'https://lastfm-img2.akamaized.net/i/u/64s/e4b1e25d34694b5d89541185ef45cfa3.png'
      },
      {},
      {}
    ],
    listeners: '581520'
  }];
  Trackster.renderTracks(tinyDancerTracks);
  if (!$("a[href='https://www.last.fm/music/Elton+John/_/Tiny+Dancer']").length) {
    errors.push("renderTracks: renderTracks should add an <a> tag link to each track's preview url.");
  }
  if (!$("body:contains('Tiny Dancer')").length) {
    errors.push("renderTracks: renderTracks should add each track's name to the track list.");
  }
  if (!$("body:contains('Elton John')").length) {
    errors.push("renderTracks: renderTracks should add each track's artist's name to the track list.");
  }
  if (!$("img[src='https://lastfm-img2.akamaized.net/i/u/64s/e4b1e25d34694b5d89541185ef45cfa3.png']").length) {
    errors.push("renderTracks: renderTracks should add each track's album art to the track list.");
  }
  if (!$("body:contains('581520')").length) {
    errors.push("renderTracks: renderTracks should add each track's total number of listeners to the track list.");
  }

  Trackster.renderTracks([]);
  if ($("body:contains('Tiny Dancer')").length) {
    errors.push("renderTracks: renderTracks should empty the HTML of the track list before rendering a new list of tracks.");
  }

  $('body').html(userHtml);
};

TracksterTests.testSearchTracksByTitle = function(errors) {
  var hasSearchTracksByTitle = Trackster.searchTracksByTitle && typeof Trackster.searchTracksByTitle === 'function';
  if (!hasSearchTracksByTitle) {
    errors.push("searchTracksByTitle: Trackster object should have a function called searchTracksByTitle.");
    // If searchTracksByTitle method is missing, remaining tests will not work.
    return;
  }

  var mockAjax = TracksterTests.mock($, 'ajax');

  Trackster.searchTracksByTitle('tiny');

  if (!mockAjax.getCalls().length) {
    errors.push("searchTracksByTitle: searchTracksByTitle should call $.ajax.");
  } else {
    var url, successFn;
    var call = mockAjax.getCalls()[0];
    if (typeof call[0] === 'string') {
      url = call[0];
      successFn = call[1] && call[1].success;
    } else {
      url = call[0] && call[0].url;
      successFn = call[0] && call[0].success;
    }

    if (!url) {
      errors.push('searchTracksByTitle: $.ajax must specify a "url" parameter.');
    } else {
      var match = url.match(/https:\/\/ws\.audioscrobbler\.com\/2\.0\/\?method=track\.search&track=.*&api_key=([a-z]|\d){32}&format=json/);
      if (!match) {
        errors.push("searchTracksByTitle: $.ajax url should hit the ws.audioscrobbler.com/2.0/method=track.search endpoint.");
      } else {
        params = match[0].split('&');
        if (params.length < 2) {
          errors.push('searchTracksByTitle: $.ajax url should have parameters for "track", "api_key", and "format" separated by an "&".');
        } else {
          if (!params.includes('track=tiny')) {
            errors.push('searchTracksByTitle: $.ajax url should have a parameter called "track" with a value of the supplied title parameter.');
          } else {
            if (!params[2].match(/api_key=([a-z]|\d){32}/)) {
              errors.push('searchTracksByTitle: $.ajax url should have a parameter called "api_key" set to a valid API key.');
            } else {
              if (!params.includes('format=json')) {
                errors.push('searchTracksByTitle: $.ajax url should have a parameter called "format" with a value of "json".');
              }
            }
          }
        }
      }
    }

    if (!successFn) {
      errors.push('searchTracksByTitle: $.ajax must specify a "success" parameter.');
    } else {
      var mockRender = TracksterTests.mock(Trackster, 'renderTracks');
      var mockItems = 'Tiny Dancer';
      var response = {
        results: {
          trackmatches: {
            track: [
              {
                name: mockItems
              }
            ]
          }
        }
      };
      successFn(response);
      if (!mockRender.getCalls().length) {
        errors.push('searchTracksByTitle: "success" callback should call Trackster.renderTracks().');
      } else if (mockRender.getCalls()[0][0][0].name !== mockItems) {
        errors.push("searchTracksByTitle: Trackster.renderTracks() should be called with data located in the returned response's `data`.");
      }
      mockRender.restore();
    }
  }
  mockAjax.restore();
};

TracksterTests.mock = function(object, functionName) {
  var oldFn = object[functionName];
  var calls = [];
  object[functionName] = function() {
    calls.push(Array.prototype.slice.apply(arguments));
  };
  return {
    restore: function() {
      object[functionName] = oldFn;
    },
    getCalls: function() {
      return calls;
    }
  };
};

TracksterTests.logErrors = function(errors) {
  if (errors.length === 0) {
    console.log('%cAll TracksterTests passed!', 'color: #30AD35');
  } else {
    errors = new Set(errors);
    var errorMessage = ' errors found:';
    if (errors.size === 1) {
      errorMessage = ' error found:';
    }
    console.log('%c' + errors.size + ' ' + errorMessage, 'color: #BA1222');
    errors.forEach(function(error) {
      console.log('%c  ' + error, 'color: #BA1222');
    });
  }
};
