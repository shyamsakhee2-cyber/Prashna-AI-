import React, { useState } from 'react';
import { PrashnaData } from '../types';
import { MapPin, Calendar, Clock, Hash, Globe } from 'lucide-react';

interface PrashnaFormProps {
  onSubmit: (data: PrashnaData) => void;
  isLoading: boolean;
}

export const PrashnaForm = ({ onSubmit, isLoading }: PrashnaFormProps) => {
  const [question, setQuestion] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [lat, setLat] = useState('28.6139'); // Default New Delhi
  const [lng, setLng] = useState('77.2090');
  const [kpNumber, setKpNumber] = useState('');
  const [language, setLanguage] = useState('English');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      question,
      dateTime: `${date} ${time}`,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      kpNumber: kpNumber ? parseInt(kpNumber) : undefined,
      language
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Your Question</label>
        <textarea
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Will I get the job I interviewed for yesterday?"
          className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px] resize-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" /> Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> Location (Lat/Lng)</span>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-xs text-orange-600 hover:underline"
          >
            Use Current Location
          </button>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Hash className="w-4 h-4 text-orange-500" /> KP Number (1-249)
          </label>
          <input
            type="number"
            min="1"
            max="249"
            value={kpNumber}
            onChange={(e) => setKpNumber(e.target.value)}
            placeholder="Optional"
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-500" /> Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Bengali</option>
            <option>Marathi</option>
            <option>Tamil</option>
            <option>Telugu</option>
            <option>Gujarati</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing Prashna...
          </>
        ) : (
          'Generate Prediction'
        )}
      </button>
    </form>
  );
};
