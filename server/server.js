
(function () {

    var log = require('./log');
    var config = require('./config');
    var tcp = require('./tcp');
    var ws = require('./ws');

    log.setLevel(config.logLevel);
    log.setColoredOutput(config.coloredOutput);

    console.info();
    console.info('    stock Messaging version 1.0');
    console.info();
    console.info('    Copyright (C) 2013-2014 .');
    console.info();
    console.info('    sun_wsh@yeah.net');
    console.info();

    tcp.createServer(config.tcpPort, config.maxFrameSize);
    ws.createServer(config.wsPort, config.maxFrameSize);

}());
