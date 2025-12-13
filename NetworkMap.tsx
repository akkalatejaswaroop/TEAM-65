import React, { useMemo, useState, useRef } from 'react';
import { Station, TrackSection, Train, TrainStatus, TrainType } from '../types';
import { TrainFront, Clock, Activity } from 'lucide-react';

interface NetworkMapProps {
  stations: Station[];
  tracks: TrackSection[];
  trains: Train[];
  incidents: any[];
}

const NetworkMap: React.FC<NetworkMapProps> = ({ stations, tracks, trains, incidents }) => {
  const [hoveredTrainId, setHoveredTrainId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to find coordinates
  const getCoords = (id: string) => {
    const s = stations.find((st) => st.id === id);
    return s ? { x: s.x, y: s.y } : { x: 0, y: 0 };
  };

  const getTrainPosition = (train: Train) => {
    if (train.currentStationId) {
      return getCoords(train.currentStationId);
    }
    if (train.currentSectionId) {
      const track = tracks.find(t => t.id === train.currentSectionId);
      if (!track) return { x: 0, y: 0 };
      const from = getCoords(track.fromStationId);
      const to = getCoords(track.toStationId);
      const ratio = train.progress / 100;
      return {
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio
      };
    }
    return { x: 0, y: 0 };
  };

  const trainColor = (status: TrainStatus) => {
    switch(status) {
      case TrainStatus.ON_TIME: return '#22c55e'; // green-500
      case TrainStatus.DELAYED: return '#eab308'; // yellow-500
      case TrainStatus.CRITICAL: return '#ef4444'; // red-500
      case TrainStatus.STOPPED: return '#94a3b8'; // slate-400
      default: return '#3b82f6';
    }
  };

  const getStatusLabel = (status: TrainStatus) => {
     return status.replace('_', ' ');
  };

  const activeHoverTrain = useMemo(() => 
    trains.find(t => t.id === hoveredTrainId), 
  [trains, hoveredTrainId]);

  // Calculate tooltip position based on SVG ref and train position
  const tooltipStyle = useMemo(() => {
    if (!activeHoverTrain || !svgRef.current) return {};
    const pos = getTrainPosition(activeHoverTrain);
    const rect = svgRef.current.getBoundingClientRect();
    
    // Convert SVG 0-100 coords to pixels relative to the viewport
    const px = rect.left + (pos.x / 100) * rect.width;
    const py = rect.top + (pos.y / 100) * rect.height;

    return {
        left: px,
        top: py
    };
  }, [activeHoverTrain, trains]); 
  // Dependency on 'trains' ensures position updates when train moves

  return (
    <div className="h-full w-full bg-slate-950 relative overflow-hidden flex flex-col">
      {/* Legend / Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl pointer-events-none select-none">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-cyan-400" size={18}/> Live Network
        </h2>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> On Time</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div> Delayed</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> Incident</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <svg 
            ref={svgRef}
            viewBox="0 0 100 100" 
            className="w-full h-full max-w-5xl max-h-5xl drop-shadow-2xl"
            style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="trackGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Tracks */}
          {tracks.map((track) => {
            const from = getCoords(track.fromStationId);
            const to = getCoords(track.toStationId);
            const isBlocked = track.isBlocked;
            return (
              <g key={track.id}>
                {/* Track Glow */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isBlocked ? '#ef4444' : '#0f172a'}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
                {/* Main Track Line */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isBlocked ? '#ef4444' : '#334155'}
                  strokeWidth="0.6"
                  strokeDasharray={isBlocked ? '1,1' : ''}
                  className="transition-colors duration-500"
                />
                {isBlocked && (
                   <g transform={`translate(${(from.x + to.x)/2}, ${(from.y + to.y)/2})`}>
                      <circle r="2" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
                      <circle r="0.5" fill="#ef4444" />
                   </g>
                )}
              </g>
            );
          })}

          {/* Stations */}
          {stations.map((station) => {
            const hasIncident = incidents.some(i => i.locationId === station.id && i.status === 'OPEN');
            return (
              <g key={station.id} className="cursor-pointer hover:opacity-100 opacity-80 transition-all duration-300">
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={hasIncident ? "3" : "2"}
                  fill="#0f172a"
                  stroke={hasIncident ? '#ef4444' : '#64748b'}
                  strokeWidth="0.8"
                  className={hasIncident ? "animate-pulse" : ""}
                />
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={hasIncident ? "1.5" : "0.8"}
                  fill={hasIncident ? '#ef4444' : '#94a3b8'}
                />
                <text
                  x={station.x}
                  y={station.y + 4.5}
                  textAnchor="middle"
                  className="text-[2.5px] fill-slate-400 font-semibold tracking-wider uppercase"
                  style={{ fontSize: '2.5px', pointerEvents: 'none', textShadow: '0 1px 2px black' }}
                >
                  {station.name}
                </text>
              </g>
            );
          })}

          {/* Trains */}
          {trains.map((train) => {
            const pos = getTrainPosition(train);
            const isHovered = hoveredTrainId === train.id;
            return (
              <g 
                key={train.id} 
                style={{ 
                    transition: 'all 1s linear',
                    transformBox: 'fill-box',
                    transformOrigin: 'center'
                }}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTrainId(train.id)}
                onMouseLeave={() => setHoveredTrainId(null)}
              >
                {/* Selection Halo */}
                {isHovered && (
                    <circle cx={pos.x} cy={pos.y} r="5" fill="none" stroke="white" strokeWidth="0.1" strokeOpacity="0.3" className="animate-ping" />
                )}
                
                {/* Train Marker */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? "2.2" : "1.8"}
                  fill={trainColor(train.status)}
                  filter="url(#glow)"
                  stroke="#ffffff"
                  strokeWidth="0.3"
                  className="transition-all duration-300"
                />
                {/* Direction Indicator (Optional simple dot) */}
                <circle cx={pos.x} cy={pos.y} r="0.5" fill="#ffffff" fillOpacity="0.8" />
                
                <text
                  x={pos.x}
                  y={pos.y - 3.5}
                  textAnchor="middle"
                  className={`text-[2px] font-bold fill-white transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`}
                  style={{ fontSize: '2px', textShadow: '0 1px 2px black' }}
                >
                  {train.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip Portal */}
      {activeHoverTrain && tooltipStyle.left && (
        <div 
            className="fixed z-50 pointer-events-none"
            style={{ 
                left: tooltipStyle.left, 
                top: tooltipStyle.top,
                transform: 'translate(-50%, -120%)', // Shift up above the train
                transition: 'left 1s linear, top 1s linear' // Sync movement with SVG transition
            }}
        >
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl p-3 w-48 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2">
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <TrainFront size={14} className="text-cyan-400" />
                            {activeHoverTrain.id}
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                            {activeHoverTrain.type.replace('PASSENGER_', '').replace('_', ' ')}
                        </p>
                    </div>
                    <span 
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            activeHoverTrain.status === TrainStatus.ON_TIME ? 'bg-green-500/20 text-green-400' :
                            activeHoverTrain.status === TrainStatus.DELAYED ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}
                    >
                        {getStatusLabel(activeHoverTrain.status)}
                    </span>
                </div>
                
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Speed</span>
                        <span className="font-mono text-slate-300">{activeHoverTrain.speedKmh} km/h</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Route</span>
                        <span className="font-mono text-slate-300 text-[10px] truncate max-w-[100px]">
                            {activeHoverTrain.route.join(' → ')}
                        </span>
                    </div>
                    
                    {activeHoverTrain.delayMinutes > 0 && (
                         <div className="flex justify-between text-xs items-center bg-yellow-900/20 p-1 rounded border border-yellow-700/30">
                            <span className="text-yellow-500 flex items-center gap-1">
                                <Clock size={10} /> Delay
                            </span>
                            <span className="font-bold text-yellow-400">+{activeHoverTrain.delayMinutes} min</span>
                        </div>
                    )}
                </div>

                {/* Arrow at bottom */}
                <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform -translate-x-1/2 rotate-45"></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default NetworkMap;