import requests
import pandas as pd

# Make the GET request to the Bybit API
response = requests.get('https://api.bybit.com/v2/public/tickers')

# Parse the JSON response
data = response.json()

# Get the list of instruments
symbols = data['result']

# Filter the list of symbols to get only the futures symbols
symbol_names = [s['symbol'] for s in symbols]

df = pd.DataFrame(symbol_names)


# Print the list of instruments
print(df)

# Create a CSV file with the list of instruments
with open('instruments.csv', 'w') as f:
  f.write('Instrument\n')
  for instrument in symbol_names:
    f.write(f'{instrument}\n')
