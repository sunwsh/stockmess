
(function () {
    var websocket = require('websocket');
    var http = require('http');
    var util = require('util');
    var log = require('./log');
    var protocol = require('./protocol');
    var exchange = require('./exchange');

    // create WebSocket server, returns server instance
    exports.createServer = function (port, maxFrameSize) {
        var httpServer = http.createServer();

        httpServer.on('listening', function () {
            log.info(
                'WS Server listening at %s:%d',
                httpServer.address().address,
                httpServer.address().port
            );
        });

        var wsServer = new websocket.server({
            httpServer:httpServer,
            maxReceivedMessageSize:maxFrameSize
        });

        wsServer.on('request', function (request) {
            var connection = request.accept(null, request.origin);

            var address = util.format(
                '%s:%d',
                connection.socket.remoteAddress,
                connection.socket.remotePort
            );

            log.info('WS connection established from %s, origin is %s', address, request.origin);

            var subscriptions = {};
	
						var handleLoginReg  = function (parsed) {
 							var listStock = exchange.getAllStock();
 							
 							for (var key in listStock) {
 								var price = listStock[key];
 								connection.sendUTF(protocol.messageStart(key,price)); 
 							}
 							 							
 						};
				
 						
            var handleSubscribe = function (parsed) {
                var destination = parsed.stockid;
                if (destination in subscriptions) {
                    throw new Error(util.format('Destination \'%s\' already exists', destination));
                } else {
                    log.info('WS subscribe \'%s\' from %s', destination, address);
                    var id = exchange.add(destination, deliver);
                    subscriptions[destination] = id;
                }
            };

            var handleUnsubscribe = function (parsed) {
                var destination = parsed.stockid;
                if (destination in subscriptions) {
                    log.info('WS unsubscribe \'%s\' of %s', destination, address);
                    var id = subscriptions[destination];
                    exchange.remove(id);
                    delete subscriptions[destination];
                } else {
                    throw new Error(util.format('Destination \'%s\' does not exist', destination));
                }
            };

            var deliver = function (content,price,numb) {
                connection.sendUTF(protocol.messageFrame(content,price,numb));
            };

            connection.on('message', function (message) {
                try {
                    if (message.type != 'utf8') {
                        throw new Error('Must be utf-8 format');
                    }
                    var parsed = JSON.parse(message.utf8Data);
                    switch (parsed.type) {
                    	  case 'login':
                    	  		handleLoginReg(parsed);
                    	  		break;
                        case 'subscribe':
                            handleSubscribe(parsed);
                            break;
                        case 'unsubscribe':
                            handleUnsubscribe(parsed);
                            break;
                        default:
                            throw new Error(util.format('Unknown message type \'%s\'', parsed.type));
                            break;
                    }
                } catch (e) {
                    log.warn(e);
                    connection.sendUTF(protocol.errorFrame(e.toString()));
                }
            });

            connection.on('close', function (reasonCode, description) {
                log.info('WS connecion closed from %s', address);
                // cleanup
                log.info('WS cleanup all subscriptions of %s', address);
                for (var destination in subscriptions) {
                    var id = subscriptions[destination];
                    exchange.remove(id);
                }
                subscriptions = {};
            });
        });

        httpServer.listen(port);
        return httpServer;
    };
}());

