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

// TO MODIFY ------------------------------------
let side_market = "buy";
let confirmation_price = 1458;
// ----------------------------------------------
start();
// connects to FTX using API 
async function start() {
    let ftx = new ccxt.ftx
        ({
            'apiKey': process.env.apiKey,
            'secret': process.env.secret,
        })
    const exchangeId = 'ftx'
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass
            ({
                'apiKey': process.env.apiKey,
                'secret': process.env.secret,
            })
}
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
let lastClosing;

// getData() pulls an array of historical closing values of ETH-PERP in periods of 4H
async function getData() {
    const arr = [];
    let response = await fetch(ftxAPI);
    let data = await response.json();
    //console.log(data);
    let obj = data.result;
    for (let i = 0, len = obj.length; i < len; i++) {
        arr.push(obj[i].close);
    }
    console.log(lastClosing = arr[arr.length - 2]);
    prices_comparison();
}

function prices_comparison() {
    if (side_market == "buy") {
        if (lastClosing > confirmation_price) {
            buy();
        }
        else {
            console.log("not yet");
        }
    }
    else if (side_market = "sell") {
        if (lastClosing < confirmation_price) {
            sell();
        }
        else {
            console.log("not yet");
        }
    }
    else {
        console.log("CHECK side_market");
    }
}

let symbol = "ETH/USD:USD";
let amount = 
function buy()
{
    ftx.id, ftx.createMarketOrder(symbol, 'buy', amountLastTrade);
}

function sell()
{
    ftx.id, ftx.createMarketOrder(symbol, 'sell', amountLastTrade);
}



/*


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

/*getLastTradeDetails().then(() => {

    let side_market = buy;
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
 
*/



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