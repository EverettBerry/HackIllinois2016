var overlay;
var game;

function initAutocomplete() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];

  overlays = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    places.forEach(function(place) {
      if (places.length == 0) {
        return;
      }

      showMarker(place, markers);

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      map.fitBounds(bounds);
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
    });
  });

  game = new Game(map, markers);

}

function showMarker(place, markers, location) {

  var pic; var title; var position;
  if(place) {
    console.log('not placed');
    pic = place.icon;
    title = place.name;
    position = place.geometry.location;
  } else {
    pic = null;
    title = 'marker';
    position = location;
  }

  var icon = {
    url: pic,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  };

  // Create a marker for each place.
  markers.push(new google.maps.Marker({
    map: map,
    icon: icon,
    title: title,
    position: position
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
        displaySpecies(marker);
      });
    });
  });
}

function displaySpecies(marker) {
  
  console.log(marker);

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

      overlay = new USGSOverlay(bounds, srcImage, map);
      overlays.push(overlay);
      console.log(overlays);
    }
  });

}

google.maps.event.addDomListener(window, 'load', initAutocomplete);
