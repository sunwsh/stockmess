

(function () {

    var net = require('net');
    var util = require('util');
    var log = require('./log');
    var protocol = require('./protocol');
    var exchange = require('./exchange');

    // create TCP server, returns server instance
    exports.createServer = function (port, maxFrameSize) {
        var tcpServer = net.createServer();

        tcpServer.on('listening', function () {
            log.info(
                'TCP server listening at %s:%d',
                tcpServer.address().address,
                tcpServer.address().port
            );
        });

        tcpServer.on('connection', function (socket) {
            socket.setEncoding('utf8');

            // get client address and port
            var address = util.format('%s:%d', socket.remoteAddress, socket.remotePort);
            log.info('TCP connection established from %s', address);

            // the message frame
            var frame = '';

            // subscriptions' destination/id pair
            var subscriptions = {};

            // answer the client
            var answer = function (frame) {
                socket.write(frame + '\0', 'utf8');
            };

            // send back message frame to client
            var deliver = function (content,price,numb) {
                answer(protocol.messageFrame(content,price,numb));
            };

            // handle the message frame
            var handle = function (frame) {
                // log.info('Received from %s: %s', address, frame);

                // parse frame
                try {
                    var parsed = JSON.parse(frame);
                    switch (parsed.type) {
                    	  case 'register':
                    	  		handleRegister(parsed);
                    	      break;
                        case 'publish':
                            handlePublish(parsed);
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
                    answer(protocol.errorFrame(e.toString()));
                }
            };
						
						var handleRegister = function (parsed) {
								exchange.reg(parsed.price,parsed.stockid);
							
						};
            // handle 'publish' frame
            var handlePublish = function (parsed) {
                exchange.push(parsed.price,parsed.numb , parsed.stockid);
            };

            // handle 'subscribe' frame
            var handleSubscribe = function (parsed) {
                var stockid = parsed.stockid;
                if (stockid in subscriptions) {
                    throw new Error(util.format('stockid \'%s\' already exists', stockid));
                } else {
                    log.info('TCP subscribe \'%s\' from %s', stockid, address);
                    var id = exchange.add(stockid, deliver);
                    subscriptions[stockid] = id;
                }
            };

            // handle 'unsubscribe' frame
            var handleUnsubscribe = function (parsed) {
                var stockid = parsed.stockid;
                if (stockid in subscriptions) {
                    log.info('TCP unsubscribe \'%s\' of %s', stockid, address);
                    var id = subscriptions[stockid];
                    exchange.remove(id);
                    delete subscriptions[stockid];
                } else {
                    throw new Error(util.format('Destination \'%s\' does not exist', stockid));
                }
            };

            socket.on('error', function (exception) {
                log.warn(exception);
                socket.end();
            });

            socket.on('data', function (data) {
                /*
                 split the data by '\0'
                 for example, '\0\0hello\0\0world\0\0' will be splited into:
                 ['', '', 'hello', '', 'world', '', '']
                 to handle this array, the rule is:
                 1. the first to the (last - 1) item:
                 -- append to the frame
                 -- handle the frame
                 -- clear the frame
                 2. the last item:
                 -- append to the frame
                 */
                var fragments = data.split(/\0/);
                for (var i = 0; i < fragments.length; i++) {
                    frame += fragments[i];
                    if (frame.length > maxFrameSize) {
                        // test whether the frame exceeded the max size
                        answer(protocol.error(
                            null, 'Maximum frame size exceeded',
                            util.format('The frame is restricted to %d characters due to server config', config.maxFrameSize)));
                        socket.end();
                        break;
                    }
                    if (i < (fragments.length - 1)) {
                        // handle the frame
                        handle(frame);
                        frame = '';
                    }
                }
            });

            // 'close' event will always happened at last while 'end' probably not
            socket.on('close', function () {
                log.info('TCP Connection closed from %s', address);
                // cleanup
                log.info('TCP cleaning up all subscriptions of %s', address);
                for (var destination in subscriptions) {
                    var id = subscriptions[destination];
                    exchange.remove(id);
                }
                subscriptions = {};
            });
        });

        tcpServer.on('error', function (exception) {
            log.error('TCP Server encountered error: %j', exception);
            tcpServer.close();
        });

        tcpServer.on('close', function () {
            log.info('TCP Server closed');
        });

        tcpServer.listen(port);

        return tcpServer;
    };
}());

