// A line is an always-routed set of latlngs, stored in a 'coordinates'
// field, using a GeoJSON multilinestring represntation. Just give it a set
// of waypoints to navigate through, and it'll handle the rest.
app.Line = Backbone.Model.extend({
  urlRoot: '/api/lines',

  defaults: function() {
    var color = app.utils.getNextColor();
    var name = _.random(10, 99) + ' ' + app.utils.getRandomName();

    return {
      color: color,
      coordinates: [], // A GeoJSON MultiLineString
      mapId: undefined,
      name: name,
      serviceWindows: new app.ServiceWindows(),
      patterns: new app.Patterns([
        {name: "Inbound", coordinates: [], color: color}
        ])
    };
  },

  initialize: function() {
    // Automatically save after changes, at most once per second
    var debouncedSaved = _.debounce(function() { this.save(); }, 1000);
    this.on('change', debouncedSaved, this);
    this.get('serviceWindows').on('change', debouncedSaved, this);
  },

  parse: function(response) {
    // Use any existing nested models; create them otherwise.
    var serviceWindows = this.get('serviceWindows');
    if (!serviceWindows && response.service_windows) {
      serviceWindows = new app.ServiceWindows(response.service_windows);
    }

    // Import colors from GTFS
    var gtfsColor = response.route_color;
    if (gtfsColor && gtfsColor !== ' ' && gtfsColor !== '000000' && gtfsColor !== 'FFFFFF') {
      response.color = '#' + gtfsColor;
    }

    var attrs = {
      id: response.id,
      color: response.color,
      coordinates: response.coordinates,
      mapId: response.map_id,
      name: response.name,
      serviceWindows: serviceWindows,
      speed: response.speed,
      layover: response.layover,
      hourlyCost: response.hourly_cost,
      weekdaysPerYear: response.weekdays_per_year,
      saturdaysPerYear: response.saturdays_per_year,
      sundaysPerYear: response.sundays_per_year,
    };

    return app.utils.removeUndefined(attrs);
  },

  toJSON: function() {
    var attrs = this.attributes;
    var serviceWindows = attrs.serviceWindows.toJSON();

    return {
      id: attrs.id,
      color: attrs.color,
      coordinates: attrs.coordinates,
      map_id: attrs.mapId,
      name: attrs.name,
      service_windows: serviceWindows,
      hourly_cost: attrs.hourlyCost,
      speed: attrs.speed,
      layover: attrs.layover,
      weekdays_per_year: attrs.weekdaysPerYear,
      saturdays_per_year: attrs.saturdaysPerYear,
      sundays_per_year: attrs.sundaysPerYear,
    };
  },


  getCalculations: function() {
    var attrs = this.attributes;
    var speed = attrs.speed;
    var latlngs = _.flatten(attrs.coordinates, true);

    // Double the distance because we're assuming roundtrip
    var distance = app.utils.calculateDistance(latlngs) * 2;

    var layover = this.get('layover');
    var hourlyCost = this.get('hourlyCost');

    var weekdays = this.get('weekdaysPerYear');
    var saturdays = this.get('saturdaysPerYear');
    var sundays = this.get('sundaysPerYear');

    var calculate = function(sw) {
      if (!sw.isValid()) {
        return {
          buses: 0,
          cost: 0,
          revenueHours: 0,
        };
      }

      var minutesPerDay = app.utils.diffTime(sw.get('from'), sw.get('to'));
      var hoursPerDay =  minutesPerDay / 60;
      var roundTripTime = (distance / speed) * (1 + layover) * 60;
      var buses = Math.ceil(roundTripTime / sw.get('headway'));

      var daysPerYear = weekdays;
      if (sw.get('isSaturday')) daysPerYear = saturdays;
      if (sw.get('isSunday')) daysPerYear = sundays;
      if (sw.get('isWeekend')) daysPerYear = saturdays + sundays;

      var revenueHours = buses * hoursPerDay * daysPerYear;
      var costPerYear = revenueHours * hourlyCost;

      return {
        buses: buses,
        cost: costPerYear,
        revenueHours: revenueHours,
      };
    };

    var perWindow = attrs.serviceWindows.map(calculate);
    var total = _.reduce(perWindow, function(memo, sw) {
      return {
        buses: Math.max(memo.buses, sw.buses),
        cost: memo.cost + sw.cost,
        revenueHours: memo.revenueHours + sw.revenueHours
      };
    }, { buses: 0, cost: 0, revenueHours: 0 });

    return {
      distance: distance,
      perWindow: perWindow,
      total: total
    };
  },
});
