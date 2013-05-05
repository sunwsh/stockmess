#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include <string>
#include <vector>
#include <time.h>
#include <iostream>
#include <map>


using namespace std;

int getPublishJsonStr( std::string strStockId,float fPrice,int iNumb,std::string  &outBuf )
{
	char  lsBuf[1024];
	snprintf(lsBuf,sizeof(lsBuf),"{\"type\":\"publish\",\"stockid\":\"%s\",\"price\":\"%5.2f\",\"numb\":\"%d\" }",strStockId.c_str(),fPrice,iNumb );
	outBuf = lsBuf;
	printf("send:%s\n",lsBuf);
	return 0;
}

int getStartJsonStr( std::string strStockId,float fPrice,std::string  &outBuf )
{
	char  lsBuf[1024];
	snprintf(lsBuf,sizeof(lsBuf),"{\"type\":\"register\",\"stockid\":\"%s\",\"price\":\"%5.2f\",\"numb\":\"%d\" }",strStockId.c_str(),fPrice,0 );
	outBuf = lsBuf;
	printf("send:%s\n",lsBuf);
	return 0;
}

void PrintUsage(char *argv[])
{
	printf("Usage : %s [-h] [-p] \n", argv[0]);
	printf("        -h ip \n");
	printf("        -p port\n");
}

float random(float start, float end)
{
	float res = start+(end-start)*rand()/(RAND_MAX + 1.0);
	res = ((int)((1000)*res)/10)/100.0;
	return  res ;
}

int main(int argc, char *argv[])
{

	string  strIp = "127.0.0.1";
	short   sPort = 7013;

	if(argc < 3)
	{   
		PrintUsage(argv);
		exit(-1);
	}
		
	if ( (strcmp(argv[1],"-h") == 0)||(strcmp(argv[1],"-H") == 0) )
	{
		strIp = argv[2];
	}
	
	if(argc >= 5 )
	{
		if ( (strcmp(argv[3],"-p") == 0)||(strcmp(argv[3],"-P") == 0) )
		{
			sPort = atoi(argv[4]);
		}
	}

	printf("connect:%s:%d \n",strIp.c_str(),sPort);

	int  iType = 0;
	string  strInput;
	map<string,float>   mapStockInfo;
	vector<string>		vecStockInfo;

	srand((unsigned)time(NULL));  // 产生随机数  

	while( 0 == iType  )
	{
		cout<<"\n please input stock id(help):";
		cin>> strInput; 
		
		if(strInput == "start" )
		{
			break;
		} else if( strInput == "help" || strInput == "HELP" ) {
			cout << " start    start run " << endl;
			cout << " list     list stock " << endl;

		} else if( strInput == "list"  ) {
			cout << "stock list:";
			for( map<string,float>::iterator itMap = mapStockInfo.begin();itMap != mapStockInfo.end(); ++itMap )
			{
				cout << itMap->first << "|" << itMap->second << ",";
			}
			cout << endl;

		} else {
			int  iStockId = 0;
			iStockId = atoi(strInput.c_str());
			if( iStockId > 0 )
			{
				float  dwStockNum = random(1,50);
				mapStockInfo[strInput] = dwStockNum;
				vecStockInfo.push_back(strInput);
			}
		}

	}



	int fd;
	int ret;
	struct sockaddr_in addr;

    fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = inet_addr( strIp.c_str());
    addr.sin_port = htons(sPort);
    
    ret = connect(fd, (struct sockaddr *)&addr, sizeof(addr));
	printf("connect:%s:%d  res=%d\n",strIp.c_str(),sPort, ret);


	if( 0 == ret )
	{
		for( map<string,float>::iterator itMap = mapStockInfo.begin();itMap != mapStockInfo.end(); ++itMap )
		{
			std::string strNetDate;
			int iSendSize;
			getStartJsonStr( itMap->first,itMap->second,strNetDate );
			iSendSize = write(fd, strNetDate.c_str(), strNetDate.size()+1 );
		}
	}	
	int  iSizeStock = mapStockInfo.size();
	while( 0 == ret )
	{
		int  iIndex = 0;
		string  strLsStockId;

		iIndex = rand() % iSizeStock;
		strLsStockId = vecStockInfo[iIndex] ;

		float  dwStockPrice; 
		int    iStockNumb;

		if( mapStockInfo.find(strLsStockId) == mapStockInfo.end() ) 
		{
			continue;
		}
		
		dwStockPrice = random(0,10);
		dwStockPrice = mapStockInfo[strLsStockId] + (dwStockPrice/100) * mapStockInfo[strLsStockId];
		dwStockPrice = ((int)((1000)*dwStockPrice)/10)/100.0;

		iStockNumb =  rand() % 1000;

		std::string strNetDate;
		int  iSendSize;
		getPublishJsonStr(strLsStockId,dwStockPrice,iStockNumb,strNetDate);
		iSendSize = write(fd, strNetDate.c_str(), strNetDate.size()+1 );

		sleep(1);
	}

	return 0;
}

