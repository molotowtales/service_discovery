"use strict"; 
var dns		= require("dns");
var Promise	= require("bluebird");
var _		= require("underscore");

class Discovery{
	constructor(domain, servers){
		this.domain = domain;
		this.servers = Array.isArray(servers) ? servers : [servers];
	}

	setup(){
		dns.setServers(this.servers);
		return this;
	}

	_endpoint(addr, protocol){
		if (addr.port == 80) {
			return 'http://' + addr.name;
		}
		if (addr.port == 443) {
			return 'https://' + addr.name;
		}

		var scheme = '';
		if (protocol == 'reqrep') {
			scheme = 'tcp';
		}
		if (protocol == 'http') {
			scheme = 'http';
		}
		if (protocol == 'workqueue') {
			scheme = 'tcp';
		}

		if (scheme) {
			return scheme + '://' + addr.name + ':' + addr.port;
		} 

		return addr.name + ':' + addr.port;
	}

	discover(name, protocol){
		return new Promise((resolve, reject) => {
			var query = '_' + name + '._' + protocol + '.' + this.domain;
			dns.resolveSrv(query, (err, addresses) => {
				if (err) {
					reject(err);
				} else {
					resolve(_.map(addresses, (addr) => {
						return {
							host: addr.name,
							port: addr.port,
							protocol: protocol,
							endpoint: this._endpoint(addr, protocol)
						};
					}));
				}
			});
		});
	}
}

module.exports = Discovery;