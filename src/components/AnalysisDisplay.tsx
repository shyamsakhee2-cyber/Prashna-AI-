import React, { useState } from 'react';
import { PredictionResult, Planet } from '../types';
import { KundliChart } from './KundliChart';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Calendar, Zap, Heart, ShieldAlert, Globe } from 'lucide-react';

interface AnalysisDisplayProps {
  result: PredictionResult;
}

export const AnalysisDisplay = ({ result }: AnalysisDisplayProps) => {
  const [transitPlanets, setTransitPlanets] = useState<Planet[]>([]);
  const [isFetchingTransits, setIsFetchingTransits] = useState(false);

  const fetchTransits = async () => {
    setIsFetchingTransits(true);
    // Simulate fetching current transits
    // In a real app, this would call an API with the current date/time
    setTimeout(() => {
      const mockTransits: Planet[] = result.planetaryPositions.map(p => ({
        ...p,
        house: ((p.house + 2) % 12) + 1, // Shift them for visual difference
        degree: (p.degree + 15) % 30,
      }));
      setTransitPlanets(mockTransits);
      setIsFetchingTransits(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-orange-900">Summary & Verdict</h2>
        </div>
        <div className="prose prose-orange max-w-none text-slate-800 font-medium leading-relaxed">
          <ReactMarkdown>{result.summary}</ReactMarkdown>
        </div>
      </div>

      {/* Kundli Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" /> Prashna Kundli
          </h3>
          <button
            onClick={transitPlanets.length > 0 ? () => setTransitPlanets([]) : fetchTransits}
            disabled={isFetchingTransits}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm ${
              transitPlanets.length > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'
            }`}
          >
            <Globe className={`w-3 h-3 ${isFetchingTransits ? 'animate-spin' : ''}`} />
            {isFetchingTransits ? 'Calculating Transits...' : transitPlanets.length > 0 ? 'Clear Transits' : 'Overlay Current Transits'}
          </button>
        </div>
        <KundliChart 
          planets={result.planetaryPositions} 
          transitPlanets={transitPlanets}
          lagnaRashi={result.lagnaRashi} 
        />
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" /> Detailed Astrological Logic
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 text-sm">
            <ReactMarkdown>{result.detailedAnalysis}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-6">
          {/* Timing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" /> Timing of Event
            </h3>
            <div className="text-slate-700 font-medium">
              {result.timingOfEvent}
            </div>
          </div>

          {/* Remedies */}
          <div className="bg-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-100 space-y-4 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Heart className="w-5 h-5" /> Recommended Remedies
            </h3>
            <div className="text-orange-50 text-sm leading-relaxed">
              <ReactMarkdown>{result.remedies}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-tight italic">
          Disclaimer: Astrology is a spiritual science based on planetary alignments. Predictions are indicative and should not be treated as absolute certainty. Use your own discretion for major life decisions.
        </p>
      </div>
    </div>
  );
};
