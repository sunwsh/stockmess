

安装运行环境 （ 注：本人是在 ubuntu-10.04.2 版本下安装调试的，其他linux版本可能略有不同）
1. 安装依赖包	
	>sudo apt-get install g++ curl libssl-dev apache2-utils  
	>sudo apt-get install git-core 
	
2. 按照node.js:
	>cd
	>git clone git://github.com/joyent/node.git  
	>cd node  
	>./configure  
	>make  
	>sudo make install 
3. 升级python （configure 失败，可能原因）
	cd Python-2.7/Modules/zlib  
	./configure 
	;make;make install 
	cd Python-2.7/  
	python2.7 setup.py install 
 
4. 安装第三方库
  >curl http://npmjs.org/install.sh | sh
  >sudo  npm install -g express
  >sudo  npm install socket.io
	>sudo  npm install websocket
  >sudo  npm install uuid
  
stockMsg 目录说明
  >server  			目录保存 nodejs程序，实现web接入后台；
     server.js      入口主程序 
     protocol.js    协议接口定义
     config.js      程序配置文件
     tcp.js         后台股票生成器接入处理模块
     ws.js          页面接入处理模块
     exchange.js    公共处理模块 
     log.js         日志打印模块 
  >cPubServer
     sendSrv.cpp    			股票交易产生进程 
     stockWebClient.html  浏览器显示页面
     
运行测试程序
  1. 先运行node.js 接入程序：
     可以在 config.js 文件中修改程序配置
       tcpPort: 7013,   // tcp listening port
       wsPort: 7015,    // websocket listening port
		 运行方法：
		 > node server/server.js
		 
	2. 运行股票交易程序
	   a）编译程序 
	      >g++ sendSrv.cpp  -o sendsrv.o
	   b) 运行sendsrv
	      程序参数有两个：
			      Usage : ./sendsrv.o [-h] [-p] 
		        -h ip    指定node.js程序IP
		        -p port  可选，默认是（7013）
	      >sudo ./sendsrv.o -h 127.0.0.1
	   c) 数据股票信息
	      运行 sendsrv 进入控制台入口:
	      > please input stock id(help):
	      
	      > 输入一个数字编号，按enter键后，就添加了一个股票编号。
	      > 在上面输入 help , 会提示其他的控制台命令说明。
	      > 在上面数据 list , 会显示现在已经输入的股票代号，和他们的开盘股价。
	      > 在上面输入 start ,程序会把数据传输到 node.js进程上去，并且会把以后产生的交易数据全部发送到node.js上。
  3. 直接用浏览器本地打开  stockWebClient.html；
     a）在上面输入框中输入node.js 服务器的web地址，点击（connect）链接；
        html 写死了web的连接端口是7015，其实我很丑；
     b）打开链接后，会收到node.js上已经注册的 股票代号，和开盘价格，
     c）选择输入一个股票代号后，点击“subcribe” 订阅后，就可以收到这支股票以后的交易信息了。
     
		
  