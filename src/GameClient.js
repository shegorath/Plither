// Imports
var WebApp = require('./web/app');
var WebSocket = require('ws');
var https = require('https');
var http = require('http');
var fs = require("fs");

// GameClient implementation
function GameClient() {
    // Config
    this.config = {
		serverType: "http",
		serverPort: 80,
		serverName: "Plither",
		serverUrl: "slither.gq",
		gameservers: [
			{"ip":"127.0.0.1","po":443}
		]
	};

    // Parse config
    this.loadConfig();
}

module.exports = GameClient;

GameClient.prototype.start = function() {
    WebApp.set('port', this.config.serverPort);
    WebApp.setConfigs( this );

    this.webServer = ( this.config.serverType == 'http' ? http.createServer(WebApp) : https.createServer(WebApp) );

    this.webServer.listen(this.config.serverPort);
    this.webServer.on('error', onError.bind(this));
    this.webServer.on('listening', onListening.bind(this));
	
	// functions
	function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.log('\u001B[31m[Client]\u001B[0m ' + this.config.webserverPort + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.log('\u001B[31m[Client]\u001B[0m ' + this.config.webserverPort + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
		return false;
    }

    function onListening() {
        var addr = this.webServer.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log('\u001B[31m[Client]\u001B[0m Game Client started at ' + bind);
		return true;
    }
};

GameClient.prototype.loadConfig = function() {
    try {
        // Load the contents of the config file
        var load = JSON.parse(fs.readFileSync('./configs/ClientConfig.json', 'utf-8'));

        // Replace all the default config's values with the loaded config's values
        for (var obj in load) {
            this.config[obj] = load[obj];
        }

    } catch (err) {
        // No config
        console.log(err);

        // Create a new config
        fs.writeFileSync('./configs/ClientConfig.json', JSON.stringify(this.config, null, '\t'));
    }
};