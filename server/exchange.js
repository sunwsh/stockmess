
(function () {
    var uuid = require('node-uuid');
    var log = require('./log');
		


    var receivers = {};
		var regStock  = {};
		
		function reg(price,stockid) {
			 regStock[stockid] = price;
		}	

		function getStock(stockid) {
			var lsPrice = 0;
			if (stockid in regStock) {
					lsPrice = regStock[stockid];
			}
			return lsPrice;	
		}
		
		function getAllStock() {
			return regStock;
		}

    // push a message with destination and call matched receivers
    function push(price,numb, stockid) {
        for (var key in receivers) {
            var receiver = receivers[key];
            
            if( stockid == receiver['stockid'] )
            {
	            var callback = receiver['callback'];

              try {
                  callback(stockid,price,numb);
              } catch (e) {
                  log.warn(e);
              }

            }
        }
    }

    function add(destinationRegex, callback) {
        try {
            var receiver = {};


            receiver['stockid']     = destinationRegex;
            
            if (!(callback instanceof Function)) {
                throw new Error('Callback is not a function');
            }
            receiver['callback'] = callback;
            var key = uuid();
            receivers[key] = receiver;
            return key
        } catch (e) {
            log.warn(e);
            throw e;
        }
    }

    // remove a message receiver by it's key
    function remove(key) {
        delete receivers[key];
    }

    module.exports = {
        push:push,
        add:add,
        remove:remove,
        reg:reg,
        getStock:getStock,
        getAllStock:getAllStock
    };
}());



