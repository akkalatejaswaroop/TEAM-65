export enum TrainStatus {
  ON_TIME = 'ON_TIME',
  DELAYED = 'DELAYED',
  CRITICAL = 'CRITICAL', // e.g. conflict imminent
  STOPPED = 'STOPPED'
}

export enum TrainType {
  PASSENGER_HIGH_SPEED = 'PASSENGER_HIGH_SPEED',
  PASSENGER_REGIONAL = 'PASSENGER_REGIONAL',
  FREIGHT = 'FREIGHT'
}

export interface Station {
  id: string;
  name: string;
  x: number;
  y: number; // 0-100 coordinate space for simplicity
  platforms: number;
}

export interface TrackSection {
  id: string;
  fromStationId: string;
  toStationId: string;
  lengthKm: number;
  maxSpeedKmh: number;
  isBlocked: boolean;
}

export interface Train {
  id: string;
  name: string;
  type: TrainType;
  status: TrainStatus;
  currentSectionId: string | null; // null if at station
  currentStationId: string | null; // null if in section
  progress: number; // 0-100% along the section
  speedKmh: number;
  route: string[]; // Array of Station IDs
  nextStationIndex: number;
  delayMinutes: number;
}

export interface Incident {
  id: string;
  type: 'SIGNAL_FAILURE' | 'TRACK_OBSTRUCTION' | 'WEATHER' | 'ROLLING_STOCK';
  locationId: string; // Station or Section ID
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
  status: 'OPEN' | 'RESOLVED';
  suggestedAction?: string;
}

export interface OptimizationResult {
  runId: string;
  timestamp: number;
  solverType: 'CLASSICAL_MIP' | 'QUANTUM_ANNEALING' | 'HYBRID_GENETIC';
  score: {
    delayReduction: number;
    energySaved: number;
    conflictsResolved: number;
  };
  changes: string[]; // Description of schedule changes
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
