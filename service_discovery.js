"use strict"; 
var dns		= require("dns");
var Promise	= require("bluebird");
var _		= require("underscore");
var url		= require("url");

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
		var u = {
			'port': addr.port,
		    'slashes': true
		};

		if (addr.port == 80) {
			u['protocol'] = 'http';
		} else if (addr.port == 443) {
			u['protocol'] = 'https';
		} else {
			if (protocol == 'reqrep') {
				u['protocol'] = 'tcp';
			}
			if (protocol == 'http') {
				u['protocol'] = 'http';
			}
			if (protocol == 'workqueue') {
				u['protocol'] = 'tcp';
			}
		}

		// :port shouldn't be appended if port 80 or 443 is used
		u[[80, 443].indexOf(addr.port) > -1 ? 'host' : 'hostname'] = addr.name;

		return url.format(u);
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