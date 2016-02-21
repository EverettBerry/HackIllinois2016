var game;

function Map() {

  this.map = null;
  this.searchBox = null;

  this.overlays = [];
  this.markers = [];
}

Map.prototype.init = function() {
  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  this.searchBox = new google.maps.places.SearchBox(input);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  this.map.addListener('bounds_changed', function() {
    searchBox.setBounds(this.map.getBounds());
  }.bind(this));

  // Listen for the event fired when the user selects a prediction and retrieve
  this.searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    console.log(this);
    this.displaySpecies();
    this.showMarker();
  }.bind(this));

  // Game initalization
  game = new Game(this.map, this.markers);
};

Map.prototype.showMarker = function() {
  // Clear out the old markers.
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];

  // For each place, get the icon, name and location.
  var bounds = new google.maps.LatLngBounds();
  places.forEach(function(place) {
    var icon = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    // Create a marker for each place.
    markers.push(new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location
    }));

    markers.forEach(function(marker) {
      marker.addListener("click", function() {

        var lat = this.getPosition().lat();
        var lon = this.getPosition().lng();
        
        var url = 'https://www.googleapis.com/fusiontables/v2/query';
        var query = '?sql=SELECT `geometry`, `ECO_CODE` ' +
          'FROM 1234FzC7FIzNvIL59dHI_m8uE1FQar-AqrINCUuHn ' +
          'WHERE ST_INTERSECTS(geometry, CIRCLE(LATLNG(' + lat + ', ' + lon + '),1)) ' +
          'LIMIT 1';
        var key = '&key=AIzaSyDMDp1YfzUX0rdz-kfts-yJqkyAH5-ILUA';

        fetch(url + query + key).then(function(response) {
          return response.text();
        }).then(function(text) {
          var ftlData = JSON.parse(text);
          console.log(ftlData);
          ecoCode = ftlData.rows[0][1];
          console.log(ecoCode);
          // TODO: layers
          // layer = new google.maps.FusionTablesLayer(ftlData);
          // console.log(layer);
          // layer.setMap(map);
          console.log(that.map);
          that.displaySpecies(marker);
        });

      });
    });

    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    zoomChangeBoundsListener = 
      google.maps.event.addListener(map, 'bounds_changed', function(event) {
        if (this.getZoom() > 10 && this.initialZoom == true) {
          // Change max/min zoom here
          this.setZoom(10);
          this.initialZoom = false;
        }
        google.maps.event.removeListener(zoomChangeBoundsListener);
      });
  });
  that.map.initialZoom = true;
  that.map.fitBounds(bounds);
};

Map.prototype.displaySpecies = function(marker) {

  var lat = marker.getPosition().lat();
  var lon = marker.getPosition().lng();

  var imgD = 0.05;
  var xshft = [0.15, 0.15, -0.15, -0.15, 0, 0];
  var yshft = [0.1, -0.1, 0.1, -0.1, 0.15, -0.15]; 

  var url = 'http://www.tagalong.xyz:8080/species/' + ecoCode;
  fetch(url).then(function(response) {
    return response.text()
  }).then(function(text) {
    console.log(text);
    var imgs = JSON.parse(text);

    for(var i=0; i<6; i++) {

      var bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(lat - imgD + yshft[i], lon - imgD + xshft[i]),
          new google.maps.LatLng(lat + imgD + yshft[i], lon + imgD + xshft[i]));

      var srcImage = imgs.imgs[i];

      overlay = new USGSOverlay(bounds, srcImage, this.map);
      overlays.push(overlay);
    }
  });
};


mmap = new Map();
google.maps.event.addDomListener(window, 'load', mmap.init);
