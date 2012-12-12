angular.module('geolocation', ['ngResource']).factory('Geolocation', function($resource) {
	var Geolocation = $resource(
		'http://open.mapquestapi.com/nominatim/v1/:action',
		{action: 'search', format: 'json', json_callback: 'JSON_CALLBACK', limit: 1, q: '82 belinda sq'},
		{get: {method: 'JSONP', isArray: true}, query: {method: 'JSONP', isArray: true}}
	)
	
	var currentPositionCache
	Geolocation.getCurrentPosition = function(callback, error) {
		var success = function(position) {
			callback(currentPositionCache = position)
		}
		navigator.geolocation.getCurrentPosition(success, error || function() {})
		navigator.geolocation.watchPosition(success, error || function() {}, {enableHighAccuracy: true, maximumAge: 3000, timeout: 60000})
		if (currentPositionCache) setTimeout(function() {success(currentPositionCache)}, 0)
	}
	
	Geolocation.getDistance = function(p1, p2) {
		var lat1 = p1.latitude, lon1 = p1.longitude
		var lat2 = p2.latitude, lon2 = p2.longitude
		
		var R = 6371; // km
		var dLat = (lat2-lat1) * Math.PI / 180;
		var dLon = (lon2-lon1) * Math.PI / 180;
		var lat1 = lat1 * Math.PI / 180;
		var lat2 = lat2 * Math.PI / 180;

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		return R * c;
	}
	
	return Geolocation
})