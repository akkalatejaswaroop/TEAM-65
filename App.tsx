import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import NetworkMap from './components/NetworkMap';
import Dashboard from './components/Dashboard';
import OptimizationPanel from './components/OptimizationPanel';
import CopilotChat from './components/CopilotChat';
import { INITIAL_TRAINS, INITIAL_INCIDENTS, STATIONS, TRACKS } from './constants';
import { Train, Incident, OptimizationResult, TrainStatus } from './types';
import { Activity, AlertTriangle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trains, setTrains] = useState<Train[]>(INITIAL_TRAINS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // Simulation tick - moves trains
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains(prevTrains => prevTrains.map(train => {
        if (train.status === TrainStatus.STOPPED) return train;
        
        let newProgress = train.progress + (train.speedKmh / 200); // Simplified movement logic
        let nextSectionId = train.currentSectionId;
        let nextStationId = train.currentStationId;
        
        // Simple loop logic for demo
        if (newProgress >= 100) {
           newProgress = 0;
           // If moving from A->B, now at B. For demo, just bounce back or loop
        }
        
        return {
          ...train,
          progress: newProgress
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const runOptimization = async (objectives: any): Promise<OptimizationResult> => {
    setIsOptimizing(true);
    // Simulate API call to quantum backend
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result: OptimizationResult = {
      runId: `OPT-${Math.floor(Math.random() * 10000)}`,
      timestamp: Date.now(),
      solverType: 'HYBRID_GENETIC',
      score: {
        delayReduction: 15,
        energySaved: 420,
        conflictsResolved: 2
      },
      changes: [
        'Re-routed TR-101 via Track BC to avoid congestion.',
        'Hold TR-205 at Station C for +3 mins to allow express pass.',
        'Adjusted arrival platform for TR-999 to Platform 4.'
      ],
      explanation: "Detected high probability of deadlock at Junction C. Quantum annealing found a solution by delaying the regional train slightly, reducing overall network delay by 12% compared to standard FIFO dispatching."
    };

    setOptimizationResult(result);
    setIsOptimizing(false);
    return result;
  };

  const handleSimulationAction = (response: any) => {
    // Handling Gemini structured outputs
    if (response.action === 'CREATE_INCIDENT') {
       const newIncident: Incident = {
         id: `INC-${Date.now()}`,
         type: 'TRACK_OBSTRUCTION',
         locationId: 'STN-C',
         description: 'User simulated obstruction via Copilot.',
         severity: 'HIGH',
         timestamp: Date.now(),
         status: 'OPEN',
         suggestedAction: 'Reroute all traffic via secondary lines.'
       };
       setIncidents(prev => [newIncident, ...prev]);
       setIsSimulationMode(true);
    } else if (response.action === 'DELAY_TRAIN') {
       // Logic to find train and add delay
       const trainId = response.parameters?.trainId || 'TR-101';
       setTrains(prev => prev.map(t => 
         t.id.includes(trainId) || t.name.includes(trainId) 
         ? { ...t, status: TrainStatus.DELAYED, delayMinutes: t.delayMinutes + 30 }
         : t
       ));
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden h-full flex flex-col">
          {/* Top warning bar if simulation mode */}
          {isSimulationMode && (
             <div className="bg-amber-500/10 border-b border-amber-500/50 p-2 text-center text-amber-500 text-xs font-bold uppercase tracking-widest">
               Simulation Mode Active - Live Data Disconnected
             </div>
          )}
          
          <div className="flex-1 overflow-auto relative">
            {activeTab === 'dashboard' && <Dashboard trains={trains} incidents={incidents} />}
            {activeTab === 'map' && <NetworkMap stations={STATIONS} tracks={TRACKS} trains={trains} incidents={incidents} />}
            {activeTab === 'optimization' && (
              <OptimizationPanel 
                onRunOptimization={runOptimization} 
                lastResult={optimizationResult}
                isOptimizing={isOptimizing} 
              />
            )}
            
            {/* Visual Placeholders for Future Features */}
            {activeTab === 'gantt' && (
               <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-900/50">
                   <Activity size={48} className="mb-4 opacity-50 text-cyan-500" />
                   <h3 className="text-lg font-medium text-slate-300">Schedule Timeline</h3>
                   <p className="max-w-md text-center mt-2 text-sm">Interactive Gantt chart visualization is initializing...</p>
                   <div className="mt-8 w-full max-w-2xl h-64 bg-slate-950/50 rounded-lg border border-slate-800 relative overflow-hidden">
                       {[1,2,3,4].map(i => (
                           <div key={i} className="absolute h-6 bg-cyan-900/30 rounded border border-cyan-800/30" style={{
                               top: `${i * 45}px`,
                               left: `${10 + Math.random() * 40}%`,
                               width: `${20 + Math.random() * 30}%`
                           }}></div>
                       ))}
                   </div>
               </div>
            )}
             {activeTab === 'incidents' && (
               <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-900/50">
                   <AlertTriangle size={48} className="mb-4 opacity-50 text-red-500" />
                   <h3 className="text-lg font-medium text-slate-300">Incident Command</h3>
                   <p className="max-w-md text-center mt-2 text-sm">Incident management subsystem is loading.</p>
                   <div className="mt-6 flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-700 animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-slate-700 animate-bounce delay-100"></div>
                      <div className="h-2 w-2 rounded-full bg-slate-700 animate-bounce delay-200"></div>
                   </div>
               </div>
            )}
          </div>
        </div>
        
        {/* Right Sidebar - Copilot */}
        <CopilotChat onSimulationAction={handleSimulationAction} />
      </div>
    </Layout>
  );
}

export default App;