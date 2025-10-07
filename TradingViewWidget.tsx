import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createWidget = () => {
      if (container.current && 'TradingView' in window) {
        container.current.innerHTML = ''; // Clean up previous widget
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: '5',
          timezone: 'Etc/UTC',
          theme: 'dark', // Hardcode to dark for a professional look, as seen in user's image.
          style: '1',
          locale: 'en',
          toolbar_bg: 'transparent',
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          container_id: container.current.id,
          hide_top_toolbar: false,
          withdateranges: false,
          save_image: false,
          details: false,
          hotlist: false,
          calendar: false,
          disabled_features: [
              "header_symbol_search",
              "symbol_search_hot_key",
              "header_chart_type",
              "header_indicators",
              "header_compare",
              "header_settings",
              "header_screenshot",
              "header_fullscreen_button",
              "use_localstorage_for_settings"
          ],
          enabled_features: ["header_resolutions"],
          // Overrides to hide the symbol name from the legend to reduce clutter
          overrides: {
            "paneProperties.legendProperties.showSeriesTitle": false,
          },
        });
      }
    };

    const scriptId = 'tradingview-widget-script';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    } else {
      if ('TradingView' in window) {
        createWidget();
      } else {
        document.getElementById(scriptId)?.addEventListener('load', createWidget);
      }
    }
      
    return () => {
        const scriptEl = document.getElementById(scriptId);
        if (scriptEl) {
            scriptEl.removeEventListener('load', createWidget);
        }
        if (container.current) {
            container.current.innerHTML = '';
        }
    }

  }, [symbol]);

  return <div id={`tradingview_widget_container_${symbol}`} ref={container} className="w-full h-full" />;
};


export default memo(TradingViewWidget);
