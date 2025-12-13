import React, { useState } from 'react';
import { Cpu, Zap, Play, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import { OptimizationResult, Train } from '../types';

interface OptimizationPanelProps {
  onRunOptimization: (objectives: any) => Promise<OptimizationResult>;
  lastResult: OptimizationResult | null;
  isOptimizing: boolean;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ onRunOptimization, lastResult, isOptimizing }) => {
  const [objectives, setObjectives] = useState({
    minimizeDelay: 80,
    energyEfficiency: 40,
    stability: 60,
  });

  const handleRun = () => {
    onRunOptimization(objectives);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full overflow-y-auto">
      {/* Configuration Column */}
      <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-cyan-400" />
            Optimization Engine
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure solver constraints and objectives.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Minimize Total Delay</span>
              <span className="text-cyan-400 font-mono">{objectives.minimizeDelay}%</span>
            </div>
            <input
              type="range"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              value={objectives.minimizeDelay}
              onChange={(e) => setObjectives({ ...objectives, minimizeDelay: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Energy Efficiency</span>
              <span className="text-green-400 font-mono">{objectives.energyEfficiency}%</span>
            </div>
            <input
              type="range"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
              value={objectives.energyEfficiency}
              onChange={(e) => setObjectives({ ...objectives, energyEfficiency: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Schedule Stability</span>
              <span className="text-purple-400 font-mono">{objectives.stability}%</span>
            </div>
            <input
              type="range"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              value={objectives.stability}
              onChange={(e) => setObjectives({ ...objectives, stability: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Solver Selection</h3>
          <div className="flex flex-col gap-2 text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <input type="radio" name="solver" defaultChecked className="accent-cyan-500" />
              <span>Auto-Select (Hybrid Quantum-Classical)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="solver" className="accent-cyan-500" />
              <span>Quantum Annealing (Simulated)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="solver" className="accent-cyan-500" />
              <span>Classical MIP (Gurobi/CPLEX)</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={isOptimizing}
          className={`mt-auto py-4 rounded-lg font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
            isOptimizing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
          }`}
        >
          {isOptimizing ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
              Computing...
            </>
          ) : (
            <>
              <Zap size={24} /> Run Optimization
            </>
          )}
        </button>
      </div>

      {/* Results Column */}
      <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
        {!lastResult && !isOptimizing && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <BarChart3 size={64} className="mb-4 opacity-50" />
            <p className="text-lg">No optimization results yet.</p>
            <p className="text-sm">Configure objectives and click Run to start.</p>
          </div>
        )}

        {isOptimizing && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative w-32 h-32">
               <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
               <Cpu className="absolute inset-0 m-auto text-cyan-500 animate-pulse" size={40} />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-slate-200">Quantum Processing Unit Active</h3>
                <p className="text-slate-400 mt-2">Annealing energy landscape to find global minimum...</p>
                <div className="mt-4 flex gap-2 justify-center text-xs font-mono text-cyan-400">
                    <span>Qubits: 2048</span>
                    <span>|</span>
                    <span>Coherence: 99.2%</span>
                </div>
            </div>
          </div>
        )}

        {lastResult && !isOptimizing && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                 <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                   <CheckCircle /> Optimization Complete
                 </h3>
                 <p className="text-xs text-slate-500 font-mono mt-1">Run ID: {lastResult.runId} • {lastResult.solverType}</p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-bold text-slate-100">{lastResult.score.conflictsResolved}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Conflicts Resolved</div>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-xs uppercase mb-1">Delay Reduction</div>
                  <div className="text-2xl font-bold text-cyan-400">-{lastResult.score.delayReduction} min</div>
               </div>
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-xs uppercase mb-1">Energy Saved</div>
                  <div className="text-2xl font-bold text-green-400">{lastResult.score.energySaved} kWh</div>
               </div>
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-xs uppercase mb-1">Solver Time</div>
                  <div className="text-2xl font-bold text-purple-400">0.04s</div>
               </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Strategy Explanation
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                    {lastResult.explanation}
                </p>
            </div>

            <div>
                <h4 className="font-semibold text-slate-200 mb-2">Schedule Adjustments</h4>
                <ul className="space-y-2">
                    {lastResult.changes.map((change, idx) => (
                        <li key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded border border-slate-800 text-sm">
                            <span className="w-6 h-6 rounded-full bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                            </span>
                            <span className="text-slate-300">{change}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationPanel;
