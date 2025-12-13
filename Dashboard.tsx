import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Train, Incident, TrainStatus } from '../types';
import { Clock, AlertTriangle, Activity, TrainFront } from 'lucide-react';

interface DashboardProps {
  trains: Train[];
  incidents: Incident[];
}

const Dashboard: React.FC<DashboardProps> = ({ trains, incidents }) => {
  const delayedCount = trains.filter(t => t.status === TrainStatus.DELAYED).length;
  const criticalCount = trains.filter(t => t.status === TrainStatus.CRITICAL).length;
  const onTimeCount = trains.filter(t => t.status === TrainStatus.ON_TIME).length;
  
  // Mock data for the chart
  const data = [
    { time: '08:00', onTime: 95, delay: 5 },
    { time: '09:00', onTime: 92, delay: 8 },
    { time: '10:00', onTime: 88, delay: 12 },
    { time: '11:00', onTime: 94, delay: 6 },
    { time: '12:00', onTime: 96, delay: 4 },
    { time: '13:00', onTime: 90, delay: 10 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrainFront size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Trains Active</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-2">{trains.length}</h3>
          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
             <Activity size={12} /> +2 scheduled
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium">On-Time Performance</p>
          <h3 className="text-3xl font-bold text-green-400 mt-2">
            {Math.round((onTimeCount / trains.length) * 100)}%
          </h3>
          <p className="text-xs text-slate-500 mt-1">Target: 92%</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Delayed Trains</p>
          <h3 className="text-3xl font-bold text-yellow-400 mt-2">{delayedCount}</h3>
          <p className="text-xs text-slate-500 mt-1">Avg delay: 12 min</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Active Incidents</p>
          <h3 className="text-3xl font-bold text-red-400 mt-2">{incidents.filter(i => i.status === 'OPEN').length}</h3>
          <p className="text-xs text-slate-500 mt-1">Requires attention</p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6">
           <h3 className="text-lg font-bold text-slate-200 mb-6">Network Punctuality Trend</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                 <XAxis dataKey="time" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                 />
                 <Area type="monotone" dataKey="onTime" stroke="#22c55e" fillOpacity={1} fill="url(#colorOnTime)" name="On-Time %" />
                 <Area type="monotone" dataKey="delay" stroke="#eab308" fillOpacity={1} fill="url(#colorDelay)" name="Delay %" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Critical Alerts</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {incidents.length === 0 ? (
                <div className="text-slate-500 text-center py-10">No active alerts.</div>
            ) : (
                incidents.map(inc => (
                    <div key={inc.id} className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-red-400 text-sm">{inc.type}</span>
                            <span className="text-xs text-slate-500">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{inc.description}</p>
                        <div className="mt-2 text-xs bg-slate-900/50 p-2 rounded text-slate-400">
                            Action: {inc.suggestedAction}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
