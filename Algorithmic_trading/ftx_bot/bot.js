'use strict';
const ccxt = require('ccxt');
const axios = require('axios').default;
require("dotenv").config();
const fetch = require('node-fetch');
const SMA = require('technicalindicators').SMA;
const EMA = require('technicalindicators').EMA;
const crypto = require('crypto');
const { request } = require('http');
const { clearInterval } = require('timers');

let tradeExecuted;

// connects to FTX using API 
(async function () {
    let ftx = new ccxt.ftx({
        'apiKey': process.env.apiKey,
        'secret': process.env.secret,
    })
    const exchangeId = 'ftx'
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass({
            'apiKey': process.env.apiKey,
            'secret': process.env.secret,
        })
    let dateUTCTimeStamp = 0;
    let dateUTCTimeStampx = 0;
    let currentDateUTCTimeStamp = 0;
    let currentDateUTCTimeStampx = 0;
    let currentTime;
    function getDateInUTCTimestamp() {
        const date = new Date();
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var monthCurrent = date.getUTCMonth();
        var day = date.getUTCDate() - 1;
        var dayCurrent = date.getUTCDate();
        var hour = date.getUTCHours();
        var minute = date.getUTCMinutes();
        var second = date.getUTCSeconds();
        var localTime = date.toLocaleTimeString();
        currentTime = localTime;
        currentDateUTCTimeStampx = Date.UTC(year, monthCurrent, dayCurrent, hour, minute, second);
        currentDateUTCTimeStamp = currentDateUTCTimeStampx.toString().substr(0, currentDateUTCTimeStampx.toString().length - 4);
        dateUTCTimeStampx = Date.UTC(year, month, day, hour, minute, second);
        dateUTCTimeStamp = dateUTCTimeStampx.toString().substr(0, dateUTCTimeStampx.toString().length - 4);

    }
    getDateInUTCTimestamp();
    const ftxAPI = 'https://ftx.com/api/markets/ETH-PERP/candles?resolution=14400&start_time=' + dateUTCTimeStamp;
    var getOutShort;
    var getOutLong;
    let sideLastTrade;
    let amountLastTrade;
    let symbol;
    let lastTrade;
    let secondLastTrade;
    let amountSecondLastTrade;
    let ethPrice;


    // getData() pulls an array of historical closing values of BTC-PERP in periods of 15min
    async function getData() {
        try {
            const arr = [];
            let response = await fetch(ftxAPI);
            let data = await response.json();
            //console.log(data);
            let obj = data.result;
            for (let i = 0, len = obj.length; i < len; i++) {
                arr.push(obj[i].close);
            }
            // stopLossTriggered() calculates SMA & EMA and returns a bolean. If false, fast EMA is above slow MA, otherwise True. 
            function stopLossTriggered() {
                var periodSMA = 30; //30
                const smaArray = [];
                smaArray.push(SMA.calculate({ period: periodSMA, values: arr }));
                var periodEMA = 13; //13
                const emaArray = [];
                emaArray.push(EMA.calculate({ period: periodEMA, values: arr }));
                var auxSma = 0;
                var auxEma = 0;
                for (var i = 0; i < smaArray.length; i++) {
                    var innerArrSma = smaArray[i];
                    for (var j = 0; j < innerArrSma.length; j++) {
                        auxSma = innerArrSma[j];
                    }
                }
                for (var k = 0; k < emaArray.length; k++) {
                    var innerArrEma = emaArray[k];
                    for (var u = 0; u < innerArrEma.length; u++) {
                        auxEma = innerArrEma[u];
                    }
                }

                getEthPrice();
                if (auxSma < ethPrice) {
                    getOutShort = true;
                    getOutLong = false;

                } else {
                    getOutLong = true;
                    getOutShort = false;
                }

                console.log('Get Out from Short', getOutShort);
                console.log('Get Out from Long', getOutLong);


                console.log('-------------------------------');

                console.log('ETH Price', ethPrice);
                console.log('SMA (Slow - 30)', auxSma);
                console.log('*******************************');
            }



            // getLastTradeDetails() pulls an array of trades opened and closed. 
            // Amount & side of the market is extracted from last trade taken. 
            async function getLastTradeDetails() {

                let arr = (ftx.id, await ftx.fetchMyTrades());
                for (let i = 0, len = arr.length; i < len; i++) {
                    lastTrade = arr[i];
                    secondLastTrade = arr[i - 1];
                }
                //console.log(secondLastTrade);
                amountSecondLastTrade = secondLastTrade.amount;
                sideLastTrade = lastTrade.side;
                amountLastTrade = lastTrade.amount;
                symbol = lastTrade.symbol;

                getDateInUTCTimestamp();
                console.log('Date & Time', currentTime);
                console.log('Symbol - ', symbol);
                console.log('Last trade market side - ', sideLastTrade);
                console.log('Last trade size - ', amountLastTrade);
                console.log('Second Last trade size - ', amountSecondLastTrade);
                console.log('*******************************');
            }

            async function getEthPrice() {
                let ethObj = (ftx.id, await ftx.fetchTicker('ETH-PERP'));
                ethPrice = ethObj.last;
            }

            async function marketOrder() {
                //let ethObj = (ftx.id, await  ftx.fetchTicker('ETH-PERP'));
                //ethPrice = ethObj.last;
                //let newSize = 10 / btcPrice;
                //console.log(ethPrice); // put 500, that'd mean 20k of trades of 5usd. This is based on a capital outlay of 50usd, putting 5% per trade

                if (amountLastTrade == amountSecondLastTrade) {
                    console.log(amountLastTrade);
                    console.log(amountSecondLastTrade);

                    console.log('last two trades sizes are equal');
                    stopInterval();
                } else {
                    if (sideLastTrade == 'buy') {
                        ftx.id, ftx.createMarketOrder(symbol, 'sell', amountLastTrade);
                        //ftx.id, ftx.createMarketOrder(symbol, 'sell', newSize);
                    } else {
                        ftx.id, ftx.createMarketOrder(symbol, 'buy', amountLastTrade);
                        //ftx.id, ftx.createMarketOrder(symbol, 'buy', newSize);
                    }
                    //ftx.id, ftx.createMarketOrder(symbol, sideLastTrade, amountLastTrade);
                    ftx.id, ftx.cancelAllOrders(symbol);
                }

                //if (sideLastTrade == 'buy') {
                //    ftx.id, ftx.createMarketOrder(symbol, 'sell', newSize);
                //} else {
                //    ftx.id, ftx.createMarketOrder(symbol, 'buy', newSize);
                //}

            }

            getLastTradeDetails().then(() => {

                let aux = sideLastTrade;
                if (aux == 'buy') {
                    if (getOutLong == true) {
                        console.log('me salgo de la posicion')
                        //marketOrder();
                        //stopInterval();

                    } else if (getOutLong == false) {
                        console.log('Price is above, do nothing')

                    }
                } else {
                    console.log(getOutShort);

                    if (getOutShort == true) {
                        console.log('me salgo del short');
                        //marketOrder();
                        //stopInterval();

                    } else if (getOutShort == false) {
                        console.log('Price is below, do nothing')
                    }
                }

            });

           
                stopLossTriggered();
                getLastTradeDetails();
            


        } catch (error) {
            console.log(error);
        }
    }
    // check if position is open, if yes run the code
    // stop code when code ran once / use cleanInterval();
    // divide code into long and short positions so one is able to choose which side of the market
    // check that if code is running in short, a short should have been opened, otherwise dont execute
    // when doing testing and first trades in real time, move most of the funds to a subaccount and see whats up
    let myInterval = setInterval(getData, 5000);
    function run() {
        myInterval;
    }

    function stopInterval() {
        clearInterval(myInterval);
    }
    run();
    //AUthentication
    /*
    async function getPositions(){
        try{
            let response = await fetch('https://ftx.com/api/account');
            let ftxKey = process.env.secret;
            let ftxTs = currentDateUTCTimeStamp;
            let HTTPMethod = 'GET';
            let requestPath = '/account';
            let mix = ftxTs + HTTPMethod + requestPath;
            console.log(mix);
            var hash = crypto.createHmac('sha256',ftxKey)
                    .update(mix)
                    .digest('hex');
            response.headers['FTX-KEY'] = process.env.apiKey;
            response.headers['FTX-SIGN'] = hash;
            response.headers['FTX-TS'] = ftxTs;
            console.log(response);
        }catch(error){
            console.log(error);
        }
    }
    getPositions();
    /*
    async function getPositions2(){
        try{
            const response = await fetch('https://ftx.com/api/account');
            const secret = process.env.secret;
            const timestamp = ccxt.milliseconds().toString();

const method = 'GET';
            const request = '/api/account'
            let auth = timestamp + method + request;
            let authEncoded = ccxt.encode(auth);
            const signature = await ccxt.hmac(ccxt.encode(secret),authEncoded,'sha256');
            response.headers['FTX-KEY'] = process.env.apiKey;
            response.headers['FTX-SIGN'] = signature;
            response.headers['FTX-TS'] = timestamp;
            console.log(response);
        }catch(error){
            console.log(error);
        }
    }
    getPositions2();
    */
    //console.log(SMA.calculate({period: period, values : values}));
    //console.log (bitfinex.id,  await bitfinex.loadMarkets  ())x
    //console.log (huobipro.id,  await huobipro.loadMarkets ())
    //console.log (ftx.id,    await ftx.fetchOrderBook (ftx.symbols['BTC']))
    //console.log (ftx.id,  await ftx.fetchTicker ('BTC-PERP'))
    //console.log (ftx.id,  await ftx.fetchTrades ('BTC-PERP'))
    //console.log(ftx.id, await ftx.fetchTicker('BTC-PERP') )
    // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
    //console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))
    // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
    //console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))
    // pass/redefine custom exchange-specific order params: type, amount, price or whatever
    // use a custom order type
    //xbitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })
})();