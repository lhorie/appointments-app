angular.module('appointment', ['ngResource']).factory('Appointment', function($resource) {
	var Appointment = $resource('https://api.mongolab.com/api/1/databases/leotest/collections/appointments/:id',
		{apiKey: '50c613cbe4b0527042fd63ee'},
		{update: {method: 'PUT'}}
	)
	
	Appointment.prototype.update = function(callback) {
		return Appointment.update({id: this._id.$oid}, angular.extend({}, this, {_id: undefined}), callback)
	}
	
	Appointment.prototype.destroy = function(callback) {
		return Appointment.remove({id: this._id.$oid}, callback)
	}
	return Appointment
})