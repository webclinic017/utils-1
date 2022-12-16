import backtrader as bt
import datetime
import yfinance as yf

cerebro = bt.Cerebro()

import os
from dotenv import load_dotenv, find_dotenv
from binance import Client, ThreadedWebsocketManager, ThreadedDepthCacheManager
from binance.enums import HistoricalKlinesType
import pandas as pd
import numpy as np
import matplotlib.dates as mpl_dates
import matplotlib.pyplot as plt
import plotly.graph_objs as go
import plotly.subplots as a

#testnet 
#https://testnet.binancefuture.com/en/futures/ETHUSDT

# loads .env file
load_dotenv(find_dotenv())

# sets client
api_key = os.getenv("api_key")
api_secret = os.getenv("api_secret")
client = Client(api_key, api_secret)

# pulls data
# :return: list of OHLCV values (Open time, Open, High, Low, Close, Volume, Close time, Quote asset volume, Number of trades, Taker buy base asset volume, Taker buy quote asset volume, Ignore)
def get_data():
    historical_data = client.get_historical_klines(
    "ETHUSDT", Client.KLINE_INTERVAL_4HOUR, "5 day ago UTC", klines_type=HistoricalKlinesType.FUTURES)
    return historical_data

# converts historial data into a DataFrame, name first five columns and converts time from Epoch Unix (milliseconds) to my time
dataframe = pd.DataFrame(get_data())
df = dataframe.loc[:, 0:4]
df.columns = ['date', 'open', 'high', 'low', 'close']
df['date'] = pd.to_datetime(df['date'], unit='ms')
print (df)

feed = bt.feeds.PandasData(dataname=dataframe)
cerebro.adddata(feed)
cerebro.run()
cerebro.plot()
