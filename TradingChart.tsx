import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, UTCTimestamp, ColorType, CrosshairMode } from 'lightweight-charts';
import type { Candle } from '../types';
import { useTheme } from '../contexts/ThemeContext';

// Define the structure for an indicator to be passed as a prop
export type Indicator = 
  | { type: 'MA'; period: number; color: string; }
  | { type: 'RSI'; period: number; color: string; };

interface TradingChartProps {
  data: Candle[];
  indicators?: Indicator[];
}

// Helper to calculate Moving Average
const calculateMA = (data: CandlestickData[], period: number): LineData[] => {
  const result: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
};

// Helper to calculate RSI
const calculateRSI = (data: CandlestickData[], period: number): LineData[] => {
  const result: LineData[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (i <= period) {
      if (change > 0) gains += change;
      else losses -= change;

      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / (avgLoss || 1);
        const rsi = 100 - (100 / (1 + rs));
        result.push({ time: data[i].time, value: rsi });
        gains = avgGain;
        losses = avgLoss;
      }
    } else {
      let currentGain = 0;
      let currentLoss = 0;
      if (change > 0) currentGain = change;
      else currentLoss = -change;
      
      gains = (gains * (period - 1) + currentGain) / period;
      losses = (losses * (period - 1) + currentLoss) / period;
      
      const rs = gains / (losses || 1);
      const rsi = 100 - (100 / (1 + rs));
      result.push({ time: data[i].time, value: isNaN(rsi) ? 0 : rsi });
    }
  }
  return result;
};


const TradingChart: React.FC<TradingChartProps> = ({ data, indicators = [] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const indicatorSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});
  const { theme } = useTheme();
  const rsiPaneIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB', style: 2 },
        horzLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB', style: 2 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);
  
  // Update theme
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
       layout: {
        textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
        horzLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
      },
       rightPriceScale: {
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
      },
    });
  }, [theme]);

  // Update data
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const formattedData: CandlestickData[] = data.map(d => ({
          time: d.time as UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close
      }));
      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);
  
  // Update indicators
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !data) return;

    // Clear existing indicator series
    Object.values(indicatorSeriesRef.current).forEach(series => chartRef.current!.removeSeries(series));
    indicatorSeriesRef.current = {};
    if (rsiPaneIdRef.current) {
        chartRef.current.removePriceScale(rsiPaneIdRef.current);
        rsiPaneIdRef.current = null;
    }

    const candlestickData: CandlestickData[] = data.map(d => ({...d, time: d.time as UTCTimestamp}));
    const hasRSI = indicators.some(i => i.type === 'RSI');
    
    // Adjust main pane height if RSI is present
    const mainPaneHeight = hasRSI ? 0.7 : 1;
    chartRef.current.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: hasRSI ? 1 - mainPaneHeight : 0.1 }});

    indicators.forEach((indicator, index) => {
      const indicatorId = `${indicator.type}-${indicator.period}-${index}`;
      
      if (indicator.type === 'MA') {
        const maData = calculateMA(candlestickData, indicator.period);
        const maSeries = chartRef.current!.addLineSeries({
          color: indicator.color,
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
          priceScaleId: 'right', // Attach to main price scale
        });
        maSeries.setData(maData);
        indicatorSeriesRef.current[indicatorId] = maSeries;
      }
      
      if (indicator.type === 'RSI' && !rsiPaneIdRef.current) { // Only add one RSI pane
        rsiPaneIdRef.current = `rsi_pane_${Date.now()}`;
        chartRef.current.addPriceScale(rsiPaneIdRef.current, {
            scaleMargins: { top: mainPaneHeight + 0.05, bottom: 0 },
        });

        const rsiSeries = chartRef.current.addLineSeries({
          color: indicator.color,
          lineWidth: 2,
          priceScaleId: rsiPaneIdRef.current,
        });
        
        const rsiData = calculateRSI(candlestickData, indicator.period);
        rsiSeries.setData(rsiData);

        // Add overbought/oversold lines
        rsiSeries.createPriceLine({ price: 70, color: '#EF4444', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Overbought' });
        rsiSeries.createPriceLine({ price: 30, color: '#10B981', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Oversold' });
        indicatorSeriesRef.current[indicatorId] = rsiSeries;
      }
    });
     // Force a resize to apply pane changes correctly
    chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);

  }, [data, indicators, theme]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};


export default TradingChart;
