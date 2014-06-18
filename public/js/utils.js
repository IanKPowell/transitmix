app.utils = app.utils || {};

// Returns a set of coordinates that connect between 'from' and 'to' latlngs
// If an point.via is provided, the route will go through that point
// E.g. getRoute({from: [20, 30], to: [23, 40]}, callback)
app.utils.getRoute = function(latlngs, callback, context) {
  // Flips from [lat, lng] to [lng, lat]
  var flip = function(latlng) {
    return [latlng[1], latlng[0]];
  };

  var waypoints = [latlngs.from, latlngs.to];
  if (latlngs.via) waypoints.splice(1, 0, latlngs.via);
  waypoints = waypoints.map(flip).join(';');

  var url = 'http://api.tiles.mapbox.com/v3/codeforamerica.h6mlbj75/' +
  'directions/driving/' + waypoints + '.json?geometry=polyline';

  $.getJSON(url, function(response) {
    if (response.error || response.routes.length === 0) {
      console.log('Unable to find route.', response.error);
    }

    var geometry = response.routes[0].geometry;
    var coordinates = app.utils.decodeGeometry(geometry);
    callback.call(context || this, coordinates);
  });
};

// Takes an encoded geometry and returns a set of latlngs
app.utils.decodeGeometry = function(encoded, precision) {
  precision = precision || 6;
  precision = Math.pow(10, -precision);
  var len = encoded.length, index=0, lat=0, lng = 0, array = [];
  while (index < len) {
    var b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    array.push( [lat * precision, lng * precision] );
  }
  return array;
};

// Geocode a city into a latlng and a more formalized city name 
// using the  Google Maps geocoding API.
app.utils.geocode = function(city, callback, context) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' +
  encodeURI(city) + '&sensor=false&key=AIzaSyCcgZLlBTM4GY0RhkUjy4MDD9RaZ0zIoiY';

  $.getJSON(url, function(response) {
    if (response.error || response.results.length === 0) {
      console.log('Unable to geocode city. Womp Womp.', response.error);
    }

    // Get the coordinates for the center of the city
    var location = response.results[0].geometry.location;
    var latlng = [location.lat, location.lng];

    // Get the city's name. In google maps this is called 'locality'
    var name = city;
    var components = response.results[0].address_components;
    for (var i = 0; i < components.length; i++) {
      if (_.contains(components[i].types, 'locality')) {
        name = components[i].long_name;
        break;
      }
    }

    callback.call(context || this, latlng, name);
  });
};

// Calculate the distance between two latlngs.
// e.g. haversine([12.33, 78.99], [13.192, 79.11])
// https://github.com/niix/haversine/blob/master/haversine.js
app.utils.haversine = (function() {
  var toRad = function(num) {
    return num * Math.PI / 180;
  };

  return function haversine(start, end, options) {
    var miles = 3960;
    var km    = 6371;
    options   = options || {};

    var R = options.unit === 'km' ? km : miles;

    var dLat = toRad(end[0] - start[0]);
    var dLon = toRad(end[1] - start[1]);
    var lat1 = toRad(start[0]);
    var lat2 = toRad(end[0]);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    if (options.threshold) {
      return options.threshold > (R * c);
    } else {
      return R * c;
    }
  };
})();

// Calculate the distance from an array of latlngs
app.utils.calculateDistance = function(latlngs) {
  var haversine = app.utils.haversine;
  var sum = 0;

  for(var i = 0; i < latlngs.length - 1; i++) {
    sum += haversine(latlngs[i], latlngs[i + 1]);
  }

  return sum;
};

// Lightens or darkens a CSS hex color value
app.utils.tweakColor = function(color, percent) {
  if (color[0] === '#') color = color.slice(1);
  var num = parseInt(color,16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;

  var value = (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
  return '#' + value;
};

// Given an array of latlngs, finds the index of
// the closest location to point
app.utils.indexOfClosest = function(arr, point) {
  var closest = 0;
  var minDistance = app.utils.haversine(arr[0], point);

  for (var i = 1; i < arr.length; i++) {
    var distance = app.utils.haversine(arr[i], point);
    if (distance < minDistance) {
      minDistance = distance;
      closest = i;
    }
  }

  return closest;
};

// Given a line defined by two points, and a third point,
// find the distance between the point and the line
app.utils.distanceToLine = function(latlng1, latlng2, point) {
    // source: http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    var x0 = latlng1[1];
    var x1 = latlng2[1];
    var y0 = latlng1[0];
    var y1 = latlng2[0];

    // y = mx + b (slope of a line)
    var m = (y1-y0)/(x1-x0);
    var b = y0 - m * x0;

    // distance(mx - y + b = 0)
    var distance = Math.abs(m*point[1] - point[0] + b)/Math.sqrt(m*m + 1);
    return distance;
};

// Given an array of latlngs, finds the point within the line
// closest to the point given, and returns that point and the
// index it would belong in the line
app.utils.closestPointInRoute = function(arr, point) {
    var closestDistance = Infinity;
    var closestIndex = -1;

    // for each point in arr, check distance from point to
    // the line from arr[i] -> arr[i+1]
    for (var i = 0; i < arr.length - 1; i++) {
        var newDistance = app.utils.distanceToLine(arr[i], arr[i+1], point);
        if (newDistance < closestDistance) {
            closestDistance = newDistance;
            closestIndex = i + 1;
        }
    }

    var closestPointInLine = function(latlng1, latlng2, point) {
        // find the coordinates closest to point on the line defined by
        // points latlng1 and latlng2
        // source: http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
        var x0 = latlng1[1];
        var x1 = latlng2[1];
        var y0 = latlng1[0];
        var y1 = latlng2[0];

        // y = mx + b (slope of a line)
        var m = (y1-y0)/(x1-x0);
        var b = y0 - m * x0;

        var new_lat = (m*(point[1] + m*point[0]) + b) / (m*m+1);
        var new_lng = (-1*(-1*point[1] - m*point[0]) - m*b) / (m*m+1);

        return [new_lat, new_lng];
    };

    var closestPoint = closestPointInLine(arr[closestIndex-1], arr[closestIndex], point);
    return {
        point: closestPoint,
        index: closestIndex
    };
};

// Adds commas to a number
app.utils.addCommas = function(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Round cost to two significant figures and format it.
// Only works for thousands and millions.
app.utils.formatCost = function(cost) {
  if (cost >= 10000000) {
    return '$' + (cost / 1000000).toFixed(0) + ' million';
  } else if (cost >= 1000000) {
    return '$' + (cost / 1000000).toFixed(1) + ' million';
  } else if (cost > 1000) {
    return '$' + (cost / 1000).toFixed(0) + 'k';
  } else {
    return '$' + cost;
  }
};

// Simple utility to calculate the difference, in minutes, between two hours
// formatted as either military time (23:00) or standard time (11pm). Does not
// work hours that cross day-boundries (e.g. 11pm to 1am).
app.utils.diffTime = function(from, to) {
  var minutesIntoDay = function(time) {
    var hours = parseInt(time.split(':')[0], 10);
    if (time.indexOf('pm') > -1 || time.indexOf('p') > -1) hours += 12;
    var minutes = 0;
    if (time.indexOf(':') > -1) minutes = parseInt(time.split(':')[1], 10);
    return hours * 60 + minutes;
  };

  var diff = (minutesIntoDay(to) - minutesIntoDay(from));
  return diff;
};

// Removes undefined and null values from an object
app.utils.removeUndefined = function(object) {
  return _.reduce(object, function(memo, val, key) {
    if(val !== undefined && val !== null) memo[key] = val;
    return memo;
  }, {});
};

// Cycles through available line colors, starting at a random point
app.utils.getNextColor = (function() {
  var colors = ['#AD0101', '#0D7215', '#4E0963', '#0071CA'];
  var colorIndex = _.random(0, colors.length);

  return function() {
    colorIndex++;
    if (colorIndex >= colors.length) colorIndex = 0;
    return colors[colorIndex];
  };
})();

app.utils.getRandomName = (function() {
  var names = ['Haberdasher', 'Puddle Jumper', 'Calypso', 'Inverter',
    'Heart of Gold', 'Yamato', 'Starfighter', 'Belafonte', 'Cousteau',
    'X Wing', 'Y Wing', 'TIE Fighter', 'Google Bus'];

  return function() {
    return _.sample(names);
  };
})();

app.utils.getBaseUrl = function() {
  // Internet explorer doesn't have window.location.origin :(
  if (!window.location.origin) {
      var port = window.location.port ? ':' + window.location.port : '';
      return window.location.protocol + '//' + window.location.hostname + port;
  } else {
      return window.location.origin;
  }
};