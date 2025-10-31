import numpy as np
import pandas as pd
from volume_weighted_macd import volume_weighted_macd

def calculate_wavetrend(df, n1=10, n2=21):
    """
    Calculate WaveTrend indicator
    Parameters:
    df: DataFrame with OHLC data
    n1: Channel Length (default=10)
    n2: Average Length (default=21)
    """
    hlc3 = (df['high'] + df['low'] + df['close']) / 3
    esa = hlc3.ewm(span=n1).mean()
    d = abs(hlc3 - esa).ewm(span=n1).mean()
    ci = (hlc3 - esa) / (0.015 * d)
    wt1 = ci.ewm(span=n2).mean()
    wt2 = wt1.rolling(window=4).mean()
    
    return wt1, wt2

def calculate_macd_dema(df, fast=12, slow=26, signal=9):
    """
    Calculate MACD using Double Exponential Moving Average
    Parameters:
    df: DataFrame with OHLC data
    fast: Fast period (default=12)
    slow: Slow period (default=26)
    signal: Signal period (default=9)
    """
    # Calculate regular EMA
    ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
    ema_slow = df['close'].ewm(span=slow, adjust=False).mean()
    
    # Calculate DEMA
    ema_fast_2 = ema_fast.ewm(span=fast, adjust=False).mean()
    ema_slow_2 = ema_slow.ewm(span=slow, adjust=False).mean()
    
    dema_fast = 2 * ema_fast - ema_fast_2
    dema_slow = 2 * ema_slow - ema_slow_2
    
    # Calculate MACD and Signal line
    macd = dema_fast - dema_slow
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line
    
    return macd, signal_line, histogram

def calculate_bollinger_bands(df, period=20, std_dev=2):
    """
    Calculate Bollinger Bands
    Parameters:
    df: DataFrame with OHLC data
    period: Period for moving average (default=20)
    std_dev: Number of standard deviations (default=2)
    """
    # Calculate middle band (SMA)
    middle_band = df['close'].rolling(window=period).mean()
    
    # Calculate standard deviation
    bb_std = df['close'].rolling(window=period).std()
    
    # Calculate upper and lower bands
    upper_band = middle_band + (bb_std * std_dev)
    lower_band = middle_band - (bb_std * std_dev)
    
    return upper_band, middle_band, lower_band

def format_small_number(number, precision=9):
    """
    Küçük sayıları bilimsel gösterim olmadan formatlar
    """
    if number == 0:
        return "0.0"
    
    # Bilimsel gösterimi engelle ve sabit ondalık gösterim kullan
    format_str = '{:.' + str(precision) + 'f}'
    return format_str.format(number)
