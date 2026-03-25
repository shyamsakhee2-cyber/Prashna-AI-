import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, setDoc } from './firebase';
import { PrashnaForm } from './components/PrashnaForm';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { analyzePrashna } from './services/gemini';
import { PrashnaData, PredictionResult, PrashnaHistory } from './types';
import { Sparkles, History, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PrashnaHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    // Sync user profile
    const syncUser = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Timestamp.now()
        }, { merge: true });
      } catch (error) {
        console.error('Error syncing user profile:', error);
      }
    };
    syncUser();

    const q = query(
      collection(db, 'prashna_history'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrashnaHistory[];
      setHistory(docs);
    }, (error) => {
      console.error('Firestore Error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePrashnaSubmit = async (data: PrashnaData) => {
    if (!user) {
      alert('Please sign in to generate a prediction.');
      return;
    }

    setIsLoading(true);
    setCurrentResult(null);
    try {
      const result = await analyzePrashna(data);
      setCurrentResult(result);
      
      // Save to history
      await addDoc(collection(db, 'prashna_history'), {
        uid: user.uid,
        data,
        result,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to generate prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Prashna Kundli AI</h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Master Vedic Astrology</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors relative"
                  title="History"
                >
                  <History className="w-5 h-5" />
                  {history.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-orange-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                      {history.length}
                    </span>
                  )}
                </button>
              )}
              <Auth />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Form & Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 leading-tight">
                  Ask the Cosmos, <br />
                  <span className="text-orange-600">Get Precise Answers.</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Harness the power of Prashna Shastra combined with state-of-the-art AI for deep astrological insights into your most pressing questions.
                </p>
              </div>

              <PrashnaForm onSubmit={handlePrashnaSubmit} isLoading={isLoading} />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-xs font-semibold text-slate-600">KP System Expert</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">Tajik Shastra Yoga</span>
                </div>
              </div>
            </div>

            {/* Right Column: Results & History */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-12"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-600 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">Consulting the Heavens...</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Calculating planetary positions, analyzing KP significators, and checking Tajik Yogas for your query.
                      </p>
                    </div>
                  </motion.div>
                ) : currentResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-slate-900">Your Prediction</h3>
                      <button
                        onClick={() => setCurrentResult(null)}
                        className="text-sm text-orange-600 font-semibold hover:underline"
                      >
                        Ask Another Question
                      </button>
                    </div>
                    <AnalysisDisplay result={currentResult} />
                  </motion.div>
                ) : showHistory ? (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-slate-900">Prashna History</h3>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-sm text-slate-500 font-semibold hover:underline"
                      >
                        Back to Form
                      </button>
                    </div>
                    {history.length === 0 ? (
                      <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
                        <History className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-slate-400">No history found. Ask your first question!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentResult(item.result);
                              setShowHistory(false);
                            }}
                            className="w-full text-left bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                                {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                              </span>
                              <MessageSquare className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <h4 className="font-bold text-slate-800 line-clamp-2">{item.data.question}</h4>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">
                              {item.result.summary.slice(0, 100)}...
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-12"
                  >
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-orange-200" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">Ready for your query</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Fill out the form to get a detailed astrological analysis of your question.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 grayscale opacity-50">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900">Prashna Kundli AI</span>
            </div>
            <p className="text-xs text-slate-400">
              © 2026 Prashna Kundli AI. All celestial rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-slate-400 hover:text-orange-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-400 hover:text-orange-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
