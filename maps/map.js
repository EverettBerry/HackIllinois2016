var overlay;
var overlay2;
var overlay3;
var overlay4;

function initAutocomplete() {

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13,
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

  var overlays = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

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

          var imgD = 0.05;
          var xshft = [0.15, 0.15, -0.15, -0.15, 0, 0];
          var yshft = [0.1, -0.1, 0.1, -0.1, 0.15, -0.15]; 
          
          for(var i=0; i<6; i++) {

            var bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(lat - imgD + yshft[i], lon - imgD + xshft[i]),
                new google.maps.LatLng(lat + imgD + yshft[i], lon + imgD + xshft[i]));

            var srcImage = 'https://developers.google.com/maps/documentation/javascript/';
            srcImage += 'examples/full/images/talkeetna.png';


            overlay = new USGSOverlay(bounds, srcImage, map);
            overlays.push(overlay);
          }

          layer = new google.maps.FusionTablesLayer({
            query: {
              select: 'geometry',
              from: '1234FzC7FIzNvIL59dHI_m8uE1FQar-AqrINCUuHn',
              where: 'ST_INTERSECTS(geometry, CIRCLE(LATLNG(' + lat + ', ' + lon + '),1))',
              limit: 1
            }
          });

          console.log(layer);
          layer.setMap(map);
          
        });
      });

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

}

google.maps.event.addDomListener(window, 'load', initAutocomplete);
