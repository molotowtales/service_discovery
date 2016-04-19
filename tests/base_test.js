"use strict"; 
const Discovery     	= require('./../service_discovery');

describe("Service Discovery", function(){
	it('should fetch all _file._reqrep-entries', function(done){
		var service = new Discovery('lin.education', '109.74.12.98').setup().discover('file', 'reqrep').then(function(addr){
			done();
		}).catch(done);
	});
});