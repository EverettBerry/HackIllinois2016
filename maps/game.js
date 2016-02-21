var cities = ['London, United Kingdom',
    'New York City, NY, United States',
    'Moscow, Russia',
    'Sao Paulo, Brazil',
    'Cape Town, South Africa',
    'Paris, France',
    'New Delhi, India'];

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

    } else {
      console.log("Geocode was not successful for the following reason: " + status);
    }
  });
}
