// A pattern is an always-routed set of latlngs, stored in a 'coordinates'
// field, using a GeoJSON multilinestring represntation. Just give it a set
// of waypoints to navigate through, and it'll handle the rest.
// A pattern represents a one-way direction of travel.
app.Pattern = Backbone.Model.extend({
  urlRoot: '/api/patterns',
  defaults: function() {
    return {
      name: "Inbound",
      lineId: undefined,
      coordinates: [],
      color: undefined
    }
  },

  parse: function(response) {
    var attrs = {
      name: response.name,
      coordinates: response.coordinates,
      lineId: response.line_id,
      color: response.color
    }

    return app.utils.removeUndefined(attrs);
  },

  toJSON: function() {
    var attrs = this.attributes;
    return {
      id: attrs.id,
      name: attrs.name,
      line_id: attrs.lineId,
      coordinates: attrs.coordinates,
      color: attrs.color
    }
  },

  // Extends the line to the given latlng, routing in-between
  addWaypoint: function(latlng, ignoreRoads) {
    latlng = _.values(latlng);
    var coordinates = _.clone(this.get('coordinates'));

    if (coordinates.length === 0) {
      coordinates.push([latlng]);
      this.save({ coordinates: coordinates });
      return;
    }

    app.utils.getRoute({
      from: _.last(this.getWaypoints()),
      to: latlng,
      ignoreRoads: ignoreRoads,
    }, function(route) {
      coordinates.push(route);
      this.save({ coordinates: coordinates });
    }, this);
  },

  updateWaypoint: function(latlng, index, ignoreRoads) {
    latlng = _.values(latlng);

    if (index === 0) {
      this._updateFirstWaypoint(latlng, ignoreRoads);
    } else if (index === this.get('coordinates').length - 1) {
      this._updateLastWaypoint(latlng, ignoreRoads);
    } else {
      this._updateMiddleWaypoint(latlng, index, ignoreRoads);
    }
  },

  _updateFirstWaypoint: function(latlng, ignoreRoads) {
    var coordinates = _.clone(this.get('coordinates'));
    var secondWaypoint = _.last(coordinates[1]);

    app.utils.getRoute({
      from: latlng,
      to: secondWaypoint,
      ignoreRoads: ignoreRoads,
    }, function(route) {
      coordinates[0] = [route[0]];
      coordinates[1] = route;
      this.save({ coordinates: coordinates });
    }, this);
  },

  _updateMiddleWaypoint: function(latlng, index, ignoreRoads) {
    var coordinates = _.clone(this.get('coordinates'));
    var prevWaypoint = _.last(coordinates[index - 1]);
    var nextWaypoint = _.last(coordinates[index + 1]);

    app.utils.getRoute({
      from: prevWaypoint,
      via: latlng,
      to: nextWaypoint,
      ignoreRoads: ignoreRoads,
    }, function(route) {
      var closest = app.utils.indexOfClosest(route, latlng);
      coordinates[index] = route.slice(0, closest + 1);
      coordinates[index + 1] = route.slice(closest);
      this.save({ coordinates: coordinates });
    }, this);
  },

  _updateLastWaypoint: function(latlng, ignoreRoads) {
    var coordinates = _.clone(this.get('coordinates'));
    var penultimateWaypoint = _.last(coordinates[coordinates.length - 2]);

    app.utils.getRoute({
      from: penultimateWaypoint,
      to: latlng,
      ignoreRoads: ignoreRoads,
    }, function(route) {
      coordinates[coordinates.length - 1] = route;
      this.save({ coordinates: coordinates });
    }, this);
  },

  insertWaypoint: function(latlng, index, ignoreRoads) {
    var coordinates = _.clone(this.get('coordinates'));
    var prevWaypoint = _.last(coordinates[index - 1]);
    var newSegment = [prevWaypoint, latlng];

    coordinates.splice(index, 0, newSegment);
    this.set({ coordinates: coordinates }, { silent: true });
    this.updateWaypoint(latlng, index, ignoreRoads);
  },

  removeWaypoint: function(index, ignoreRoads) {
    var coordinates = _.clone(this.get('coordinates'));

    // If we only have one point, just reset coordinates to an empty array.
    if (coordinates.length === 1) {
      this.model.clearWaypoints();
      return;
    }

    // Drop the first segment, make the second segment just the last waypoint
    if (index === 0) {
      var secondWaypoint = _.last(coordinates[1]);
      coordinates.splice(0, 2, [secondWaypoint]);
      this.save({ coordinates: coordinates });
      return;
    }

    // Just drop the last segment
    if (index === coordinates.length - 1) {
      coordinates.splice(index, 1);
      this.save({ coordinates: coordinates });
      return;
    }

    // For middle waypoints, we drop the segment, then route 
    // the next waypoint, keep it's current location. 
    var nextWaypoint = _.last(coordinates[index + 1]);
    coordinates.splice(index, 1);
    this.set({ coordinates: coordinates }, { silent: true });
    this.updateWaypoint(nextWaypoint, index, ignoreRoads);
  },

  clearWaypoints: function() {
    // TODO: This fails in strange ways if we're in the middle of waiting
    // for the ajax call for a waypoint update. Need to figure out a
    // way to cancel existing ajax calls.
    this.save({ coordinates: [] });
  },

  getWaypoints: function() {
    var coordinates = this.get('coordinates');
    return _.map(coordinates, _.last);
  },
});