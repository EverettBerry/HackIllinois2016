var score = 0;

var cities = ['London, United Kingdom',
    'New York City, NY, United States',
    'Moscow, Russia',
    'Sao Paulo, Brazil',
    'Cape Town, South Africa',
    'Paris, France',
    'New Delhi, India',
    'San Francisco, CA, United States',
    'Mexico City, Mexico',
    'Beijing, China'];

var chosenCities = [];

/** constructor */
function Game(map, markers) {
  this.map_ = map;
  this.markers_ = markers;

}

Game.prototype.start = function() {
  console.log('start');

  this.gameLoop();
}

Game.prototype.score = function() {
  score += 1;
  var sc = document.getElementById('score');
  sc.innerHTML = 'Score: ' + score / 2;
}

Game.prototype.gameLoop = function() {
  var city = Math.floor(Math.random() * 10);
  
  this.setLatLong(cities[city]);
}

Game.prototype.setLatLong = function(address) {
  var geo = new google.maps.Geocoder;

  var that = this;
  geo.geocode({'address':address},function(results, status){
    if (status == google.maps.GeocoderStatus.OK) {
      that.map_.panTo(results[0].geometry.location);
      showMarker(false, that.markers_, results[0].geometry.location);
      /*
      var bounds = new google.maps.LatLngBounds();
      bounds.extend(results[0].geometry.location);
      that.map_.fitBounds(bounds);
      */
    } else {
      console.log("Geocode was not successful for the following reason: " + status);
    }
  });
}
