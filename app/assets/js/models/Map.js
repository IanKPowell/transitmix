app.Map = Backbone.Model.extend({
  urlRoot: '/api/maps',

  defaults: function() {
    var serviceWindows = new app.ServiceWindows([
      { name: '上午',  from: '4am',  to: '6am',  headway: 30, enabled: false },
      { name: '上午高峰',  from: '6am',  to: '9am',  headway: 10, enabled: true  },
      { name: '午间',   from: '9am',  to: '3pm',  headway: 15, enabled: true  },
      { name: '晚间高峰',  from: '3pm',  to: '6pm',  headway: 10, enabled: true  },
      { name: '晚间',  from: '6pm',  to: '8pm',  headway: 15, enabled: true  },
      { name: '夜间',    from: '8pm',  to: '2am', headway: 30, enabled: false },

      { name: '周六上午',  from: '4am',  to: '6am',  headway: 30, enabled: false, isSaturday: true },
      { name: '周六', from: '6am',  to: '9pm',  headway: 15, enabled: true,  isSaturday: true },
      { name: '周六下午',  from: '9pm',  to: '2am', headway: 30, enabled: false, isSaturday: true },
      { name: '周日上午',  from: '4am',  to: '6am',  headway: 30, enabled: false, isSunday: true },
      { name: '周日',   from: '6am',  to: '9pm',  headway: 15, enabled: true,  isSunday: true },
      { name: '周日下午',  from: '9pm',  to: '2am', headway: 30, enabled: false, isSunday: true },
    ]);

    return {
      center: [],
      lines: undefined,
      name: '',
      remixedFromId: undefined,
      zoomLevel: 14,

      // Line-level settings
      serviceWindows: serviceWindows,
      hourlyCost: 120,
      layover: 0.10,
      speed: 10.0,
      weekdaysPerYear: 255,
      saturdaysPerYear: 55,
      sundaysPerYear: 55,

      // TODO: Move to user-settings, when we have users
      preferServiceHours: false,
      preferMetricUnits: true,
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
    var lines = this.get('lines');
    if (!lines && response.lines) {
      lines = new app.Lines(response.lines, { parse: true });
      lines.map = this;
    }

    var serviceWindows = this.get('serviceWindows');
    if (!serviceWindows && response.service_windows) {
      serviceWindows = new app.ServiceWindows(response.service_windows);
    }

    var attrs = {
      id: response.id,
      center: response.center,
      lines: lines,
      name: response.name,
      remixedFromId: response.remixed_from_id,
      zoomLevel: response.zoom_level,

      hourlyCost: response.hourly_cost,
      layover: response.layover,
      speed: response.speed,
      serviceWindows: serviceWindows,
      weekdaysPerYear: response.weekdays_per_year,
      saturdaysPerYear: response.saturdays_per_year,
      sundaysPerYear: response.sundays_per_year,
      
      preferServiceHours: response.prefer_service_hours,
      preferMetricUnits: response.prefer_metric_units,
    };

    return app.utils.removeUndefined(attrs);
  },

  toJSON: function() {
    // Everything except Lines, which are saved in their own models
    var attrs = this.attributes;
    return {
      id: attrs.id,
      center: attrs.center,
      name: attrs.name,
      remixed_from_id: attrs.remixedFromId,
      zoom_level: attrs.zoomLevel,

      service_windows: attrs.serviceWindows.toJSON(),
      hourly_cost: attrs.hourlyCost,
      layover: attrs.layover,
      speed: attrs.speed,

      weekdays_per_year: attrs.weekdaysPerYear,
      saturdays_per_year: attrs.saturdaysPerYear,
      sundays_per_year: attrs.sundaysPerYear,

      prefer_service_hours: attrs.preferServiceHours,
      prefer_metric_units: attrs.preferMetricUnits,
    };
  },

  getLineDefaults: function() {
    var enabled = this.get('serviceWindows').where({ enabled: true });
    var cloned = _.map(enabled, function(item) { return item.toJSON(); });
    var filteredWindows = new app.ServiceWindows(cloned);

    return {
      mapId: this.id,
      serviceWindows: filteredWindows,
      layover: this.get('layover'),
      speed: this.get('speed'),
      hourlyCost: this.get('hourlyCost'),
      weekdaysPerYear: this.get('weekdaysPerYear'),
      saturdaysPerYear: this.get('saturdaysPerYear'),
      sundaysPerYear: this.get('sundaysPerYear'),
    };
  },

  // Apply the defaults to all the lines
  applyDefaultsToAll: function() {
    this.get('lines').forEach(function(line) {
      line.set(this.getLineDefaults());
    }, this);
  },
});
