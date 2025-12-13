import { Station, TrackSection, Train, TrainType, TrainStatus, Incident } from './types';

export const STATIONS: Station[] = [
  { id: 'STN-A', name: 'Alpha Terminal', x: 10, y: 50, platforms: 4 },
  { id: 'STN-B', name: 'Bravo Junction', x: 30, y: 20, platforms: 3 },
  { id: 'STN-C', name: 'Charlie Central', x: 50, y: 50, platforms: 6 },
  { id: 'STN-D', name: 'Delta Halt', x: 70, y: 80, platforms: 2 },
  { id: 'STN-E', name: 'Echo End', x: 90, y: 50, platforms: 4 },
];

export const TRACKS: TrackSection[] = [
  { id: 'TRK-AB', fromStationId: 'STN-A', toStationId: 'STN-B', lengthKm: 120, maxSpeedKmh: 160, isBlocked: false },
  { id: 'TRK-AC', fromStationId: 'STN-A', toStationId: 'STN-C', lengthKm: 150, maxSpeedKmh: 200, isBlocked: false },
  { id: 'TRK-BC', fromStationId: 'STN-B', toStationId: 'STN-C', lengthKm: 80, maxSpeedKmh: 120, isBlocked: false },
  { id: 'TRK-CD', fromStationId: 'STN-C', toStationId: 'STN-D', lengthKm: 100, maxSpeedKmh: 140, isBlocked: false },
  { id: 'TRK-CE', fromStationId: 'STN-C', toStationId: 'STN-E', lengthKm: 180, maxSpeedKmh: 220, isBlocked: false },
  { id: 'TRK-DE', fromStationId: 'STN-D', toStationId: 'STN-E', lengthKm: 90, maxSpeedKmh: 120, isBlocked: false },
];

export const INITIAL_TRAINS: Train[] = [
  {
    id: 'TR-101',
    name: 'Quantum Express',
    type: TrainType.PASSENGER_HIGH_SPEED,
    status: TrainStatus.ON_TIME,
    currentSectionId: 'TRK-AC',
    currentStationId: null,
    progress: 45,
    speedKmh: 195,
    route: ['STN-A', 'STN-C', 'STN-E'],
    nextStationIndex: 1,
    delayMinutes: 0
  },
  {
    id: 'TR-205',
    name: 'Regional Crawler',
    type: TrainType.PASSENGER_REGIONAL,
    status: TrainStatus.DELAYED,
    currentSectionId: 'TRK-BC',
    currentStationId: null,
    progress: 80,
    speedKmh: 90,
    route: ['STN-B', 'STN-C', 'STN-D'],
    nextStationIndex: 1,
    delayMinutes: 15
  },
  {
    id: 'TR-999',
    name: 'Heavy Freight',
    type: TrainType.FREIGHT,
    status: TrainStatus.ON_TIME,
    currentSectionId: null,
    currentStationId: 'STN-E',
    progress: 0,
    speedKmh: 0,
    route: ['STN-E', 'STN-C', 'STN-A'],
    nextStationIndex: 1,
    delayMinutes: 0
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    type: 'SIGNAL_FAILURE',
    locationId: 'STN-B',
    description: 'Signal box 4 intermittency detected.',
    severity: 'MEDIUM',
    timestamp: Date.now() - 3600000,
    status: 'OPEN',
    suggestedAction: 'Reduce speed on approach to Bravo Junction.'
  }
];
