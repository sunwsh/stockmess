
(function () {

		function messageStart(stockid,strPrice) {
        return JSON.stringify({
            type:'register',
            stockid:stockid,
            price:strPrice
        });
		}
		
    function messageFrame(stockid,strPrice,strNumb) {
        return JSON.stringify({
            type:'message',
            stockid:stockid,
            price:strPrice,
            numb:strNumb
        });
    }

    function errorFrame(content) {
        return JSON.stringify({
            type:'error',
            content:content
        });
    }

    function publishFrame(content, stockid) {
        return JSON.stringify({
            type:'publish',
            stockid:stockid,
            content:content          
        });
    }

    function subscribeFrame(stockid) {
        return JSON.stringify({
            type:'subscribe',
            stockid:stockid
        });
    }

    function unsubscribeFrame(stockid) {
        return JSON.stringify({
            type:'unsubscribe',
            stockid:stockid
        });
    }

    module.exports = {
        messageFrame:messageFrame,
        errorFrame:errorFrame,
        publishFrame:publishFrame,
        subscribeFrame:subscribeFrame,
        unsubscribeFrame:unsubscribeFrame,
        messageStart:messageStart
    };
}());
