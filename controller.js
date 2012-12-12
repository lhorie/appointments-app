angular.module('appointments', ['appointment', 'geolocation']).config(function($routeProvider) {
	$routeProvider
		.when('/', {controller: ListCtrl, templateUrl: 'list.html'})
		.when('/new', {controller: CreateCtrl, templateUrl: 'detail.html'})
		.when('/edit/:appointmentId', {controller: EditCtrl, templateUrl: 'detail.html'})
		.otherwise({redirectTo: '/'})
})

function ListCtrl($rootScope, $scope, $filter, $location, Appointment, Geolocation) {
	$scope.appointments = Appointment.query()
	
	$scope.radius = 3
	$scope.currentPosition = {latitude: 0, longitude: 0}
	$scope.displayedAppointments = []
	
	$scope.nearby = function(item) {
		if (!$scope.currentPosition) return false
		else return Geolocation.getDistance(item, $scope.currentPosition) < (parseInt($scope.radius) || 5)
	}

	Geolocation.getCurrentPosition(function(position) {
		$scope.$apply(function() {
			$scope.currentPosition = position.coords
		})
	}, function() {
		$scope.$apply(function() {
			$scope.disabledLocationServices = navigator.userAgent.match(/iPhone|iPad/)
		})
	})
	
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	})
	var radius = new google.maps.Circle({
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35,
		map: map,
		radius: $scope.radius * 1000
	})
	
	var markers = []
	$scope.$watch(function() {
		var mapCenter = new google.maps.LatLng($scope.currentPosition.latitude, $scope.currentPosition.longitude)
		
		radius.setCenter(mapCenter)
		radius.setRadius($scope.radius * 1000)
		markers.forEach(function(marker) {marker.setMap(null)})
		map.setCenter(mapCenter)
		map.fitBounds(radius.getBounds())
		
		$scope.displayedAppointments.forEach(function(appointment) {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(appointment.latitude, appointment.longitude),
				map: map,
				title: appointment.address
			})
			markers.push(marker)
		})
	})
}

function CreateCtrl($scope, $location, Appointment, Geolocation) {
	$scope.save = function() {
		Geolocation.query({q: $scope.appointment.address}, function(geolocations) {
			var geolocation = geolocations.pop() || {lat: 0, lon: 0}
			$scope.appointment.latitude = geolocation.lat
			$scope.appointment.longitude = geolocation.lon
			
			Appointment.save($scope.appointment, function(appointment) {
				$location.path('/edit/' + appointment._id.$oid)
			})
		})
	}
}

function EditCtrl($scope, $location, $routeParams, Appointment) {
	Appointment.get({id: $routeParams.appointmentId}, function(appointment) {
		$scope.appointment = new Appointment(appointment)
	})
	
	$scope.destroy = function() {
		$scope.appointment.destroy(function() {
			$location.path('/')
		})
	}
	
	$scope.save = function() {
		$scope.appointment.update(function() {
			$location.path('/')
		})
	}
}