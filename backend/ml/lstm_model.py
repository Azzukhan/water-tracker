import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Input, LSTM, Dense

def train_lstm(df):
    df = df.set_index("date")
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[["percentage"]])

    X, y = [], []
    for i in range(10, len(scaled)):
        X.append(scaled[i-10:i])
        y.append(scaled[i])
    X, y = np.array(X), np.array(y)

    model = Sequential()
    model.add(Input(shape=(X.shape[1], 1)))
    model.add(LSTM(50, activation='relu'))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=50, verbose=0)

    preds = []
    last_input = scaled[-10:]
    for _ in range(4):
        pred = model.predict(last_input.reshape(1, 10, 1), verbose=0)
        preds.append(pred[0][0])
        last_input = np.vstack((last_input[1:], pred))

    inv_preds = scaler.inverse_transform(np.array(preds).reshape(-1, 1)).flatten()
    return inv_preds
