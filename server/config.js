
var log = require('./log');

module.exports = {
    // tcp listening port
    tcpPort: 7013,
    // websocket listening port
    wsPort: 7015,
    // max size of message frame, in chars(not bytes)
    maxFrameSize: 10000,
    // log level
    logLevel: log.LEVEL.ALL,
    // colored output
    coloredOutput: false
};
