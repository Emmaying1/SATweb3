import React, { useState, useCallback } from 'react';
import { getMarketAnalysis, getCryptoNews, performWebSearch } from '../services/geminiService';
import type { AIAnalysis, NewsArticle, WebSearchResult, GroundingChunk } from '../types';
import { AiAssistantIcon, ArrowUpIcon, ArrowDownIcon, NeutralIcon, NewspaperIcon, SearchIcon } from './icons';
import { useMarketData } from '../contexts/MarketDataContext';

// Component for Web Search functionality
const WebSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<WebSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const searchResult = await performWebSearch(query);
            setResult(searchResult);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred while searching.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSearch();
        }
    };

    const renderSummary = (summary: string) => {
        // Simple logic to render paragraphs and list items from newline-separated text
        const lines = summary.split('\n').filter(line => line.trim() !== '');
        const content = [];
        let listItems: string[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                content.push(<ul key={`ul-${content.length}`} className="list-disc pl-5 space-y-1">{listItems.map((item, idx) => <li key={idx}>{item}</li>)}</ul>);
                listItems = [];
            }
        };

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                listItems.push(trimmedLine.substring(2));
            } else {
                flushList();
                content.push(<p key={`p-${content.length}`}>{trimmedLine}</p>);
            }
        });
        flushList(); // Add any remaining list items
        return content;
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 mt-8">
            <div className="flex items-center space-x-3 mb-6">
                <SearchIcon className="w-8 h-8 text-sky-500 dark:text-sky-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Web Search</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything or search the web..."
                    className="w-full flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{isLoading ? 'Searching...' : 'Search'}</span>
                </button>
            </div>

            {isLoading && <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {error && <div className="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 p-4 rounded-md">{error}</div>}

            {result && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Summary</h3>
                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                            {renderSummary(result.summary)}
                        </div>
                    </div>

                    {result.sources && result.sources.length > 0 && (
                         <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Sources</h3>
                            <ul className="space-y-2">
                                {result.sources.map((source, index) => source.web && (
                                    <li key={index}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-md bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                                            <p className="font-semibold text-sky-600 dark:text-sky-400 truncate group-hover:underline">{source.web.title || 'Untitled Source'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{source.web.uri}</p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const AIAssistant: React.FC = () => {
  const { pairs } = useMarketData();
  const [selectedCoin, setSelectedCoin] = useState<string>(pairs.length > 0 ? pairs[0].base : 'Bitcoin');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [news, setNews] = useState<NewsArticle[] | null>(null);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const handleAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await getMarketAnalysis(selectedCoin);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCoin]);

  const parseNews = (text: string, sources: any[]): NewsArticle[] => {
    const articlesText = text.split('---').filter(t => t.trim());
    const articles: NewsArticle[] = [];
    articlesText.forEach((articleText, index) => {
        const headlineMatch = articleText.match(/HEADLINE: (.*)/);
        const summaryMatch = articleText.match(/SUMMARY: (.*)/);
        if (headlineMatch && summaryMatch) {
            const source = sources[index]?.web;
            articles.push({
                title: headlineMatch[1].trim(),
                summary: summaryMatch[1].trim(),
                url: source?.uri || '#',
                source: source ? new URL(source.uri).hostname.replace('www.', '') : 'Unknown Source',
                publishedDate: 'Recent'
            });
        }
    });
    return articles;
  };
  
  const handleFetchNews = useCallback(async () => {
    setIsNewsLoading(true);
    setNewsError(null);
    setNews(null);
    try {
      const { text, sources } = await getCryptoNews();
      const parsedArticles = parseNews(text, sources);
      setNews(parsedArticles);
    } catch (err: any) {
      setNewsError(err.message || 'An unexpected error occurred while fetching news.');
    } finally {
      setIsNewsLoading(false);
    }
  }, []);
  
  const SentimentIndicator: React.FC<{ sentiment: 'Bullish' | 'Bearish' | 'Neutral', score: number }> = ({ sentiment, score }) => {
    const sentimentConfig = {
      Bullish: {
        icon: <ArrowUpIcon className="w-8 h-8"/>,
        color: 'text-green-500 dark:text-green-400',
        bgColor: 'bg-green-500/10'
      },
      Bearish: {
        icon: <ArrowDownIcon className="w-8 h-8"/>,
        color: 'text-red-500 dark:text-red-400',
        bgColor: 'bg-red-500/10'
      },
      Neutral: {
        icon: <NeutralIcon className="w-8 h-8"/>,
        color: 'text-yellow-500 dark:text-yellow-400',
        bgColor: 'bg-yellow-500/10'
      }
    };
    
    const config = sentimentConfig[sentiment];

    return (
        <div className={`p-4 rounded-lg flex items-center space-x-4 ${config.bgColor}`}>
            <div className={`${config.color}`}>{config.icon}</div>
            <div>
                <p className={`text-xl font-bold ${config.color}`}>{sentiment}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Confidence: {(score * 100).toFixed(1)}%</p>
            </div>
        </div>
    );
  };

  const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400">{article.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{article.summary}</p>
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{article.source}</span>
            <span>{article.publishedDate}</span>
        </div>
    </a>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <AiAssistantIcon className="w-8 h-8 text-sky-500 dark:text-sky-400" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Market Analysis</h1>
            </div>
            <button
                onClick={handleFetchNews}
                disabled={isNewsLoading}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-md text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
            >
                <NewspaperIcon className="w-4 h-4" />
                <span>{isNewsLoading ? 'Updating...' : 'Update News'}</span>
            </button>
        </div>

        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Select a cryptocurrency and let our Gemini-powered AI provide you with a detailed, up-to-the-minute market analysis.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="w-full sm:w-auto flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {pairs.map(p => <option key={p.id} value={p.base}>{p.base}</option>)}
          </select>
          <button
            onClick={handleAnalysis}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            <span>{isLoading ? 'Analyzing...' : 'Generate Analysis'}</span>
          </button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 p-4 rounded-md">{error}</div>}

        {analysis && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SentimentIndicator sentiment={analysis.sentiment} score={analysis.confidenceScore}/>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-500 dark:text-slate-400 text-sm mb-1">Short-Term Outlook</h3>
                    <p className="text-slate-900 dark:text-white">{analysis.shortTermOutlook}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Summary</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Key Factors</h3>
                <ul className="space-y-2">
                    {analysis.keyFactors.map((factor, index) => (
                        <li key={index} className="flex items-start space-x-3 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                           <span className={`flex-shrink-0 w-5 h-5 mt-1 rounded-full ${factor.impact === 'Positive' ? 'bg-green-500' : factor.impact === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                           <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{factor.factor}: </span>
                            <span className="text-slate-500 dark:text-slate-400">{factor.impact} Impact</span>
                           </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        )}

        {(isNewsLoading || newsError || news) && <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Latest Crypto News</h2>
             {isNewsLoading && <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>}
             {newsError && <div className="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 p-4 rounded-md">{newsError}</div>}
             {news && news.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 animate-fade-in">
                    {news.map((article, index) => <NewsCard key={index} article={article}/>)}
                </div>
             )}
              {news && news.length === 0 && !isNewsLoading && (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No recent news found.</p>
              )}
        </div>}
      </div>

      <WebSearch />
      
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default AIAssistant;
