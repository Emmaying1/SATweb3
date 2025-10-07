

import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, GroundingChunk, WebSearchResult } from '../types';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this project, we'll log an error if the key is missing.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        sentiment: { 
            type: Type.STRING,
            description: "Overall market sentiment for the cryptocurrency. Must be 'Bullish', 'Bearish', or 'Neutral'.",
            enum: ['Bullish', 'Bearish', 'Neutral']
        },
        confidenceScore: {
            type: Type.NUMBER,
            description: "A score from 0.0 to 1.0 indicating confidence in the sentiment analysis."
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one-paragraph summary of the current market situation for the crypto, based on recent news and technical indicators."
        },
        keyFactors: {
            type: Type.ARRAY,
            description: "A list of key factors influencing the price.",
            items: {
                type: Type.OBJECT,
                properties: {
                    factor: { type: Type.STRING, description: "Description of the factor (e.g., 'Regulatory News', 'Network Upgrade')."},
                    impact: { 
                        type: Type.STRING, 
                        description: "The perceived impact of this factor. Must be 'Positive', 'Negative', or 'Neutral'.",
                        enum: ['Positive', 'Negative', 'Neutral']
                    }
                },
                required: ["factor", "impact"]
            }
        },
        shortTermOutlook: {
            type: Type.STRING,
            description: "A brief outlook on the potential price movement in the next 24-48 hours."
        }
    },
    required: ["sentiment", "confidenceScore", "summary", "keyFactors", "shortTermOutlook"]
};

export const getMarketAnalysis = async (coinName: string): Promise<AIAnalysis> => {
  try {
    const prompt = `
      Provide a detailed, expert-level market analysis for ${coinName}. 
      Focus on the current sentiment, recent significant news, and technical indicators.
      Your analysis should be structured and objective, suitable for a trader on a professional platform.
      Do not include any disclaimers or conversational text. Only return the JSON object.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.5,
        },
    });

    const jsonText = response.text.trim();
    const analysis: AIAnalysis = JSON.parse(jsonText);
    return analysis;

  } catch (error) {
    console.error("Error fetching market analysis from Gemini API:", error);
    throw new Error("Failed to generate AI market analysis. The API key might be missing or invalid.");
  }
};

export const getCryptoNews = async (): Promise<{ text: string; sources: any[] }> => {
  try {
    const prompt = `
      Provide the top 5 latest news headlines for major cryptocurrencies like Bitcoin and Ethereum from the last 24 hours.
      For each headline, provide a very brief one-sentence summary.
      Format the output as follows, with each story separated by "---":
      HEADLINE: [The headline]
      SUMMARY: [The summary]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };

  } catch (error) {
    console.error("Error fetching crypto news from Gemini API:", error);
    throw new Error("Failed to fetch crypto news.");
  }
};

export const getInitialPrices = async (coinSymbols: string[]): Promise<Record<string, number>> => {
  try {
    const prompt = `
      Get the current market price in USDT for the following cryptocurrencies: ${coinSymbols.join(', ')}.
      Format the output strictly as a list, with each line containing the uppercase symbol, a colon, and the price as a number. Do not include any other text, explanation, or currency symbols like '$'.
      Example:
      BTC: 125500.75
      ETH: 8210.90
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            temperature: 0,
        },
    });
    
    const text = response.text;
    const prices: Record<string, number> = {};
    
    text.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
            const symbol = parts[0].trim().toUpperCase();
            const price = parseFloat(parts[1].trim());
            if (!isNaN(price) && coinSymbols.map(s => s.toUpperCase()).includes(symbol)) {
                prices[symbol] = price;
            }
        }
    });

    if (Object.keys(prices).length === 0) {
        console.warn("Gemini did not return any prices in the expected format. Falling back to mock data.");
        return {};
    }

    return prices;

  } catch (error) {
    console.error("Error fetching initial prices from Gemini API:", error);
    // Return empty object on error to allow fallback to mock data
    return {};
  }
};

export const performWebSearch = async (query: string): Promise<WebSearchResult> => {
  try {
    const prompt = `Provide a comprehensive yet concise summary based on web search results for the query: "${query}". Structure the response with a main summary paragraph followed by key bullet points if applicable. Do not include any conversational text or disclaimers.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { summary: response.text, sources: sources as GroundingChunk[] };

  } catch (error) {
    console.error("Error performing web search with Gemini API:", error);
    throw new Error("Failed to perform web search. Please try again later.");
  }

};
