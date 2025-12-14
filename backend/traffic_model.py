import networkx as nx
import random
import time
import math

def predict_traffic(G: nx.Graph, emergency_type: str = "Ambulance", time_offset: int = 0):
    """
    Simulates AI traffic prediction with dynamic updates and emergency-specific logic.
    """
    H = G.copy()
    
    # Emergency Priority Weights (Lower is better/faster)
    # Ambulance: Fast, can run red lights (0.7x)
    # Fire: Large vehicle, needs wide roads, but priority (0.8x)
    # Police: Very fast (0.6x)
    # Logistics: Normal traffic (1.0x)
    # Organ Transport: Extreme priority (0.5x)
    priority_map = {
        "Ambulance": 0.7,
        "Fire Brigade": 0.8,
        "Police Response": 0.6,
        "Disaster Logistics": 0.9,
        "Organ Transport": 0.5,
        "Flood Rescue": 0.85,
        "Custom": 1.0
    }
    factor = priority_map.get(emergency_type, 1.0)
    
    congestion_stats = {}
    
    # Dynamic Time-Based Seed (Changes every minute)
    # This ensures "Live" feel but stability within the same minute
    current_seed = int(time.time() / 60) 
    random.seed(current_seed + time_offset)

    for u, v, data in H.edges(data=True):
        base_time = data['base_weight']
        
        # 1. Structural Congestion (Some roads are always busy)
        # Assume roads connected to "Benz Circle" or "Bus Station" are busier
        is_busy_hub = "Benz Circle" in (u, v) or "Bus Station" in (u, v)
        hub_penalty = 1.5 if is_busy_hub else 1.0
        
        # 2. Random Live Fluctuation
        # We use a noise function that evolves slowly over time
        noise = random.uniform(0.8, 1.8)
        
        # 3. Emergency Specifics
        # Fire trucks might struggle in narrow "Old City" areas (simulated by random penalty)
        if emergency_type == "Fire Brigade" and random.random() > 0.8:
            noise += 0.5 # Narrow road delay
            
        # Calculate final weight
        predicted_weight = base_time * hub_penalty * noise * factor
        
        # Determine Status
        ratio = predicted_weight / base_time
        if ratio > 2.0:
            status = "High"
        elif ratio > 1.3:
            status = "Medium"
        else:
            status = "Low"
            
        # Update Graph
        H[u][v]['weight'] = round(predicted_weight, 2)
        H[u][v]['congestion_level'] = status
        
        congestion_stats[(u, v)] = {
            "base": base_time,
            "predicted": round(predicted_weight, 2),
            "status": status
        }
        
    return H, congestion_stats

def get_traffic_forecast(G, emergency_type):
    """
    Generates a 60-minute traffic forecast profile.
    """
    forecast = []
    base_load = random.uniform(0.4, 0.6)
    
    for t in range(0, 65, 5):
        trend = math.sin(t / 20.0) * 0.3
        noise = random.uniform(-0.05, 0.05)
        congestion_index = base_load + trend + noise
        congestion_index = max(0.1, min(1.0, congestion_index))
        
        forecast.append({
            "time": f"+{t} min",
            "congestion": round(congestion_index * 100, 1)
        })
        
    return forecast
