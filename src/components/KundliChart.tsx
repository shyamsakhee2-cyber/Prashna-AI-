import { motion, AnimatePresence } from "motion/react";
import { Planet } from "../types";
import { useState, useEffect } from "react";
import { 
  X, Info, Sun, Moon, Flame, Zap, Crown, Heart, Clock, Cloud, Compass 
} from "lucide-react";

interface KundliChartProps {
  planets: Planet[];
  transitPlanets?: Planet[];
  lagnaRashi?: number;
}

const PLANET_ICONS: Record<string, { icon: any, color: string }> = {
  "Sun": { icon: Sun, color: "text-amber-500" },
  "Moon": { icon: Moon, color: "text-blue-300" },
  "Mars": { icon: Flame, color: "text-red-500" },
  "Mercury": { icon: Zap, color: "text-emerald-500" },
  "Jupiter": { icon: Crown, color: "text-yellow-500" },
  "Venus": { icon: Heart, color: "text-pink-400" },
  "Saturn": { icon: Clock, color: "text-indigo-600" },
  "Rahu": { icon: Cloud, color: "text-purple-500" },
  "Ketu": { icon: Compass, color: "text-slate-500" },
};

const SIGN_RULERS: Record<number, string> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
  7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

// राशियों के नंबर की स्थिति
const RASHI_TEXT_POS: Record<number, [number, number]> = {
  1:  [150, 75],
  2:  [85, 35],
  3:  [35, 85],
  4:  [85, 140],
  5:  [35, 215],
  6:  [85, 265],
  7:  [150, 225],
  8:  [215, 265],
  9:  [265, 215],
  10: [215, 140],
  11: [265, 85],
  12: [215, 35],
};

// भावेश (House Lord) की स्थिति
const HOUSE_LORD_POS: Record<number, [number, number]> = {
  1:  [150, 45],
  2:  [45, 35],
  3:  [35, 45],
  4:  [115, 140],
  5:  [35, 255],
  6:  [45, 265],
  7:  [150, 255],
  8:  [255, 265],
  9:  [265, 255],
  10: [185, 140],
  11: [265, 45],
  12: [255, 35],
};

const SIGN_INDICES: Record<string, number> = {
  "Aries": 0, "Taurus": 1, "Gemini": 2, "Cancer": 3, "Leo": 4, "Virgo": 5,
  "Libra": 6, "Scorpio": 7, "Sagittarius": 8, "Capricorn": 9, "Aquarius": 10, "Pisces": 11
};

interface Aspect {
  p1: Planet;
  p2: Planet;
  type: "Conjunction" | "Opposition" | "Trine" | "Square" | "Sextile";
  orb: number;
  color: string;
}

const ASPECT_CONFIG = {
  Conjunction: { angle: 0, orb: 8, color: "stroke-amber-400" },
  Opposition: { angle: 180, orb: 8, color: "stroke-red-500" },
  Trine: { angle: 120, orb: 6, color: "stroke-blue-400" },
  Square: { angle: 90, orb: 6, color: "stroke-orange-400" },
  Sextile: { angle: 60, orb: 4, color: "stroke-emerald-400" },
};

// ग्रहों की स्थिति (भाव के अनुसार)
const HOUSE_POS: Record<number, [number, number]> = {
  1:  [150, 100],
  2:  [100, 50],
  3:  [50, 100],
  4:  [100, 150],
  5:  [50, 200],
  6:  [100, 250],
  7:  [150, 200],
  8:  [200, 250],
  9:  [250, 200],
  10: [200, 150],
  11: [250, 100],
  12: [200, 50],
};

export const KundliChart = ({ planets, transitPlanets = [], lagnaRashi = 1 }: KundliChartProps) => {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAspects, setShowAspects] = useState(true);
  const [showTransits, setShowTransits] = useState(false);

  // Auto-show transits when provided
  useEffect(() => {
    if (transitPlanets.length > 0) {
      setShowTransits(true);
    } else {
      setShowTransits(false);
    }
  }, [transitPlanets.length]);
  
  // किसी विशेष भाव के लिए राशि का नंबर प्राप्त करने का फंक्शन
  const getRashiForHouse = (houseNum: number): number => {
    return ((lagnaRashi + houseNum - 2) % 12) + 1;
  };

  // ग्रहों को भावों के अनुसार समूहित करें
  const planetsByHouse: Record<number, Planet[]> = {};
  planets.forEach(p => {
    if (!planetsByHouse[p.house]) planetsByHouse[p.house] = [];
    planetsByHouse[p.house].push(p);
  });

  // गोचर ग्रहों को भावों के अनुसार समूहित करें
  const transitPlanetsByHouse: Record<number, Planet[]> = {};
  transitPlanets.forEach(p => {
    if (!transitPlanetsByHouse[p.house]) transitPlanetsByHouse[p.house] = [];
    transitPlanetsByHouse[p.house].push(p);
  });

  // Aspect Calculation
  const calculateAspects = (): Aspect[] => {
    const aspects: Aspect[] = [];
    const planetDegrees = planets.map(p => ({
      ...p,
      absDegree: (SIGN_INDICES[p.sign] || 0) * 30 + p.degree
    }));

    for (let i = 0; i < planetDegrees.length; i++) {
      for (let j = i + 1; j < planetDegrees.length; j++) {
        const p1 = planetDegrees[i];
        const p2 = planetDegrees[j];
        const diff = Math.abs(p1.absDegree - p2.absDegree);
        const angle = diff > 180 ? 360 - diff : diff;

        Object.entries(ASPECT_CONFIG).forEach(([type, config]) => {
          const orb = Math.abs(angle - config.angle);
          if (orb <= config.orb) {
            aspects.push({
              p1, p2,
              type: type as Aspect["type"],
              orb,
              color: config.color
            });
          }
        });
      }
    }
    return aspects;
  };

  const aspects = calculateAspects();

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Helper to get planet position in SVG
  const getPlanetPos = (planet: Planet): [number, number] => {
    const h = planet.house;
    const [hx, hy] = HOUSE_POS[h];
    const housePlanets = planetsByHouse[h] || [];
    const idx = housePlanets.findIndex(p => p.name === planet.name);
    const yOffset = (idx * 20) - ((housePlanets.length - 1) * 10);
    return [hx, hy + yOffset];
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div 
        className="relative bg-white p-4 rounded-xl shadow-lg border border-orange-100 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setShowAspects(!showAspects)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${showAspects ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {showAspects ? 'Hide Aspects' : 'Show Aspects'}
          </button>
          <button 
            onClick={() => setShowTransits(!showTransits)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${showTransits ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {showTransits ? 'Hide Transits' : 'Show Transits'}
          </button>
        </div>

        <svg viewBox="0 0 300 300" className="w-full h-auto">
          {/* Main Square */}
          <rect x="0" y="0" width="300" height="300" fill="none" stroke="#f97316" strokeWidth="2" />
          
          {/* Diagonals */}
          <line x1="0" y1="0" x2="300" y2="300" stroke="#f97316" strokeWidth="1" />
          <line x1="300" y1="0" x2="0" y2="300" stroke="#f97316" strokeWidth="1" />
          
          {/* Inner Diamond */}
          <line x1="150" y1="0" x2="0" y2="150" stroke="#f97316" strokeWidth="1" />
          <line x1="0" y1="150" x2="150" y2="300" stroke="#f97316" strokeWidth="1" />
          <line x1="150" y1="300" x2="300" y2="150" stroke="#f97316" strokeWidth="1" />
          <line x1="300" y1="150" x2="150" y2="0" stroke="#f97316" strokeWidth="1" />

          {/* Aspect Lines */}
          {showAspects && aspects.map((aspect, idx) => {
            const [x1, y1] = getPlanetPos(aspect.p1);
            const [x2, y2] = getPlanetPos(aspect.p2);
            return (
              <motion.line
                key={`aspect-line-${idx}`}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                className={`${aspect.color} opacity-20`}
                strokeWidth="1"
                strokeDasharray={aspect.type === "Conjunction" ? "" : "2,2"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: idx * 0.05 }}
              />
            );
          })}

          {/* Rashi Numbers and House Lords */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
            const [rx, ry] = RASHI_TEXT_POS[h];
            const [lx, ly] = HOUSE_LORD_POS[h];
            const rashi = getRashiForHouse(h);
            const ruler = SIGN_RULERS[rashi];
            
            return (
              <g key={`house-meta-${h}`}>
                <text
                  x={rx}
                  y={ry}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {rashi}
                </text>
                <text
                  x={lx}
                  y={ly}
                  fontSize="8"
                  fontWeight="800"
                  fill="#f97316"
                  opacity="0.6"
                  textAnchor="middle"
                  className="uppercase tracking-tighter"
                >
                  {ruler.slice(0, 3)}
                </text>
              </g>
            );
          })}

          {/* Planets as Icons */}
          {Object.entries(planetsByHouse).map(([houseStr, housePlanets]) => {
            const h = parseInt(houseStr);
            const [hx, hy] = HOUSE_POS[h];
            return (
              <g key={`house-planets-${h}`}>
                {housePlanets.map((p, idx) => {
                  const planetConfig = PLANET_ICONS[p.name] || { icon: Star, color: "text-slate-400" };
                  const Icon = planetConfig.icon;
                  const yOffset = (idx * 20) - ((housePlanets.length - 1) * 10);
                  
                  return (
                    <foreignObject
                      key={`${p.name}-${idx}`}
                      x={hx - 35} // Shifted left to make room for transits
                      y={hy + yOffset - 12}
                      width="50"
                      height="24"
                      className="overflow-visible"
                    >
                      <div 
                        className={`flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 select-none ${selectedPlanet?.name === p.name ? 'scale-110' : ''}`}
                        onClick={() => setSelectedPlanet(p)}
                        onMouseEnter={() => setHoveredPlanet(p)}
                        onMouseLeave={() => setHoveredPlanet(null)}
                      >
                        <div className="relative">
                          {p.isRetrograde && (
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-0 bg-red-400/30 rounded-full blur-md -z-10"
                            />
                          )}
                          <Icon className={`w-4 h-4 ${planetConfig.color} ${p.isRetrograde ? 'drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]' : ''}`} />
                        </div>
                        <span className={`text-[9px] font-black leading-none mt-0.5 px-1 rounded-sm ${
                          selectedPlanet?.name === p.name 
                            ? 'text-orange-600 bg-orange-50' 
                            : p.isRetrograde 
                              ? 'text-red-600 bg-red-50 border border-red-100' 
                              : 'text-slate-700'
                        }`}>
                          {p.name.slice(0, 2)}{p.isRetrograde ? 'ᵡ' : ''}
                        </span>
                      </div>
                    </foreignObject>
                  );
                })}
              </g>
            );
          })}

          {/* Transit Planets Overlay */}
          {showTransits && Object.entries(transitPlanetsByHouse).map(([houseStr, housePlanets]) => {
            const h = parseInt(houseStr);
            const [hx, hy] = HOUSE_POS[h];
            return (
              <g key={`transit-house-planets-${h}`}>
                {housePlanets.map((p, idx) => {
                  const planetConfig = PLANET_ICONS[p.name] || { icon: Star, color: "text-slate-400" };
                  const Icon = planetConfig.icon;
                  const yOffset = (idx * 16) - ((housePlanets.length - 1) * 8);
                  
                  return (
                    <foreignObject
                      key={`transit-${p.name}-${idx}`}
                      x={hx + 5} // Shifted right
                      y={hy + yOffset - 10}
                      width="40"
                      height="20"
                      className="overflow-visible"
                    >
                      <div 
                        className="flex flex-col items-center justify-center opacity-80 scale-75 cursor-help"
                        onMouseEnter={() => setHoveredPlanet({ ...p, name: `Transit ${p.name}` })}
                        onMouseLeave={() => setHoveredPlanet(null)}
                      >
                        <div className="relative">
                           <Icon className={`w-3 h-3 ${planetConfig.color} filter saturate-[1.5]`} />
                           <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[6px] w-2.5 h-2.5 rounded-full flex items-center justify-center font-bold border border-white shadow-sm">T</div>
                        </div>
                        <span className="text-[7px] font-bold text-blue-600 bg-blue-50 px-0.5 rounded-sm border border-blue-100">
                          {p.name.slice(0, 2)}
                        </span>
                      </div>
                    </foreignObject>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredPlanet && !selectedPlanet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                left: mousePos.x + 10, 
                top: mousePos.y + 10,
                pointerEvents: 'none'
              }}
              className="absolute z-50 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700 text-[10px] min-w-[120px]"
            >
              <div className="font-bold text-orange-400 mb-1 border-b border-slate-700 pb-1">
                {hoveredPlanet.name} {hoveredPlanet.isRetrograde ? '(Retrograde)' : ''}
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sign:</span>
                  <span>{hoveredPlanet.sign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degree:</span>
                  <span>{hoveredPlanet.degree.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">House:</span>
                  <span>{hoveredPlanet.house}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip / Details Panel */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl border border-slate-700 z-10"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = PLANET_ICONS[selectedPlanet.name] || { icon: Star, color: "text-slate-400" };
                    const SelectedIcon = config.icon;
                    return <SelectedIcon className={`w-4 h-4 ${config.color}`} />;
                  })()}
                  <h4 className="font-bold text-sm">{selectedPlanet.name} Details</h4>
                </div>
                <button 
                  onClick={() => setSelectedPlanet(null)}
                  className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] uppercase tracking-wider font-semibold">
                <div className="flex flex-col">
                  <span className="text-slate-400">Sign</span>
                  <span className="text-orange-300">{selectedPlanet.sign}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">Degree</span>
                  <span className="text-orange-300">{selectedPlanet.degree.toFixed(2)}°</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">House</span>
                  <span className="text-orange-300">{selectedPlanet.house}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">Status</span>
                  <span className={selectedPlanet.isRetrograde ? "text-red-400" : "text-green-400"}>
                    {selectedPlanet.isRetrograde ? "Retrograde" : "Direct"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
              <span>Rashi No.</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-400/60 rounded-full"></span>
              <span>House Lord</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full border border-white shadow-sm flex items-center justify-center text-[6px] text-white font-bold">T</span>
              <span>Transit</span>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 font-mono italic">
            {selectedPlanet ? `Viewing ${selectedPlanet.name}` : 'Click a planet icon for details'}
          </div>
        </div>
      </div>

      {/* Aspects List Section */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500" />
          Planetary Aspects
        </h3>
        {aspects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {aspects.map((aspect, idx) => (
              <div 
                key={`aspect-item-${idx}`}
                className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-[10px] shadow-sm hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {(() => {
                      const Icon1 = (PLANET_ICONS[aspect.p1.name] || { icon: Star }).icon;
                      const Icon2 = (PLANET_ICONS[aspect.p2.name] || { icon: Star }).icon;
                      return (
                        <>
                          <Icon1 className={`w-3 h-3 ${PLANET_ICONS[aspect.p1.name]?.color}`} />
                          <Icon2 className={`w-3 h-3 ${PLANET_ICONS[aspect.p2.name]?.color}`} />
                        </>
                      );
                    })()}
                  </div>
                  <span className="font-bold text-slate-700">
                    {aspect.p1.name.slice(0, 3)} - {aspect.p2.name.slice(0, 3)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                    aspect.type === "Conjunction" ? "bg-amber-100 text-amber-700" :
                    aspect.type === "Opposition" ? "bg-red-100 text-red-700" :
                    aspect.type === "Trine" ? "bg-blue-100 text-blue-700" :
                    aspect.type === "Square" ? "bg-orange-100 text-orange-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {aspect.type}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Orb: {aspect.orb.toFixed(1)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs italic">
            No major aspects found between planets.
          </div>
        )}
      </div>
    </div>
  );
};

const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
