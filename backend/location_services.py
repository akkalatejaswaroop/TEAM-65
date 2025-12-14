import requests
import time
import random

class LocationServices:
    """
    Wrapper for Mappls (MapmyIndia) and Google Maps APIs.
    Features:
    - Geocoding, Routing, Traffic, EV Stations, Matrix Routing.
    """
    
    def __init__(self):
        # ---------------------------------------------------------
        # 🔑 API KEY CONFIGURATION
        # ---------------------------------------------------------
        self.ors_key = ""
        try:
            import streamlit as st
            # We look for 'ORS_KEY' now
            val = st.secrets.get("ORS_KEY", "")
            if val:
                self.ors_key = val
        except Exception as e:
             print(f"Warning: Could not load secrets: {e}")
             self.ors_key = ""
             
    def search_place(self, query):
        """
        Uses OpenRouteService Geocoding API.
        """
        if not self.ors_key or "YOUR_ORS_KEY" in self.ors_key:
            return None
            
        import openrouteservice
        client = openrouteservice.Client(key=self.ors_key)
        
        try:
            # Pelias Geocoding Search
            res = client.pelias_search(text=query, size=1)
            if res and 'features' in res and len(res['features']) > 0:
                feat = res['features'][0]
                lon, lat = feat['geometry']['coordinates'] # ORS uses [lon, lat]
                label = feat['properties']['label']
                return (lat, lon, label)
            return None
        except Exception as e:
            print(f"ORS Geocoding Error: {e}")
            return None

    def get_route_metrics(self, u_pos, v_pos):
        """
        Fetches travel metrics using OpenRouteService Directions.
        Returns: (duration_minutes, distance_km, congestion_level, route_geometry)
        """
        if len(self.ors_key) < 10:
            return self._simulate_traffic_data(u_pos, v_pos)
            
        import openrouteservice
        # Decode polyline
        from shapely import wkt
        from openrouteservice.convert import decode_polyline
        
        client = openrouteservice.Client(key=self.ors_key)
        
        # ORS expects [[lon, lat], [lon, lat]]
        coords = [[u_pos[1], u_pos[0]], [v_pos[1], v_pos[0]]]
        
        try:
            # profile='driving-car'
            routes = client.directions(coordinates=coords, profile='driving-car', format='json')
            
            if routes and 'routes' in routes and len(routes['routes']) > 0:
                route = routes['routes'][0]
                summary = route['summary']
                
                dist_km = summary['distance'] / 1000.0
                dur_min = summary['duration'] / 60.0
                
                # Decode geometry for mapping
                geometry_encoded = route['geometry']
                decoded_coords = decode_polyline(geometry_encoded)
                # decoded_coords is usually {'coordinates': [[lon, lat], ...], 'type': 'LineString'}
                path_points = [(p[1], p[0]) for p in decoded_coords['coordinates']] # Convert to [(lat, lon)]
                
                # Infer congestion
                avg_speed = dist_km / (dur_min / 60.0) if dur_min > 0 else 50
                
                status = "Low"
                if avg_speed < 20: status = "High"
                elif avg_speed < 35: status = "Medium"
                
                return round(dur_min, 2), round(dist_km, 2), status, path_points
                
            # Fallback
            res = self._simulate_traffic_data(u_pos, v_pos)
            if len(res) == 4:
                sim_time, sim_dist, sim_cong, _ = res
            else:
                 sim_time, sim_dist, sim_cong = res
            return sim_time, sim_dist, sim_cong, None
            
        except Exception as e:
            # Print full error stack logic
            print(f"ORS CRITICAL FAILURE: {str(e)}")
            res = self._simulate_traffic_data(u_pos, v_pos)
            if len(res) == 4:
                sim_time, sim_dist, sim_cong, _ = res
            else:
                 sim_time, sim_dist, sim_cong = res
            return sim_time, sim_dist, sim_cong, None

    def _simulate_traffic_data(self, p1, p2, live_mode=False):
        """
        Internal fallback ensuring the app works without keys.
        """
        import math
        # Haversine
        R = 6371
        lat1, lon1 = p1
        lat2, lon2 = p2
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        dist_km = R * c
        
        # Base speed 40 km/h -> 1.5 min per km
        base_time = dist_km * 1.5
        
        # Add dynamic noise
        noise = random.uniform(0.8, 2.0)
        final_time = round(base_time * noise, 2)
        
        status = "Low"
        if noise > 1.3: status = "Medium"
        if noise > 1.6: status = "High"
        
        return final_time, round(dist_km, 2), status, None


    def check_geofence(self, vehicle_pos, fence_center, radius_km=2.0):
        """
        Checks if vehicle is within a circular geofence.
        """
        # Calculate distance
        # unpack 4 values (time, dist, status, geom)
        _, dist_km, _, _ = self._simulate_traffic_data(vehicle_pos, fence_center)
        return dist_km <= radius_km, dist_km

    def track_assets(self):
        """
        Simulates tracking multiple assets (Assets API).
        """
        # Base list
        assets = [
            {"id": "AMB-01", "type": "Ambulance", "speed": 45, "lat": 16.5010, "lon": 80.6540, "status": "Moving"},
            {"id": "FIRE-09", "type": "Fire Truck", "speed": 0, "lat": 16.4970, "lon": 80.6440, "status": "Idle"},
            {"id": "POL-22", "type": "Patrol", "speed": 30, "lat": 16.5180, "lon": 80.6200, "status": "Patrolling"},
            {"id": "AMB-04", "type": "Ambulance", "speed": 55, "lat": 16.5100, "lon": 80.6600, "status": "Moving"},
            {"id": "DRONE-X1", "type": "Aerial Unit", "speed": 80, "lat": 16.5050, "lon": 80.6500, "status": "Recon"},
            {"id": "POL-35", "type": "Patrol", "speed": 20, "lat": 16.4900, "lon": 80.6300, "status": "Patrolling"},
            {"id": "TRANS-02", "type": "Organ Transport", "speed": 60, "lat": 16.5200, "lon": 80.6700, "status": "Priority"},
            {"id": "FIRE-11", "type": "Fire Truck", "speed": 0, "lat": 16.4950, "lon": 80.6100, "status": "Idle"}
        ]
        
        # Dynamic Jiggle
        for a in assets:
            if a['status'] != "Idle":
                # Simulated movement
                a['lat'] += random.uniform(-0.008, 0.008)
                a['lon'] += random.uniform(-0.008, 0.008)
                a['speed'] = max(0, a['speed'] + random.randint(-5, 5))
                
        return assets
