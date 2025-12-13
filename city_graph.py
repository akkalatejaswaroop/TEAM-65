import networkx as nx
import math

def create_city_graph(city_name="Vijayawada"):
    """
    Creates a realistic graph for the selected city.
    Nodes are landmarks with GPS coordinates.
    Algorithm connects them logically.
    """
    G = nx.Graph()
    
    nodes = {}
    edges = []
    if city_name == "Vijayawada":
        nodes = {
            "Benz Circle": (16.5003, 80.6534),
            "PVP Square": (16.4965, 80.6430),
            "Bus Station": (16.5080, 80.6160),
            "Railway Station": (16.5180, 80.6200),
            "Kanaka Durga Temple": (16.5146, 80.6050),
            "Government Hospital": (16.5050, 80.6300),
            "Airport (Gannavaram)": (16.5300, 80.7000), 
            "Auto Nagar": (16.4900, 80.6800),
            "Bhavani Island": (16.5200, 80.5900),
            "Ramavarappadu Ring": (16.5300, 80.6600),
            "Control Room": (16.5100, 80.6150)
        }
        edges = [
            ("Benz Circle", "PVP Square", 5), ("Benz Circle", "Auto Nagar", 8),
            ("Benz Circle", "Ramavarappadu Ring", 10), ("Benz Circle", "Government Hospital", 6),
            ("PVP Square", "Government Hospital", 4), ("PVP Square", "Bus Station", 7),
            ("Bus Station", "Railway Station", 5), ("Bus Station", "Control Room", 2),
            ("Control Room", "Kanaka Durga Temple", 4), ("Kanaka Durga Temple", "Bhavani Island", 6),
            ("Railway Station", "Government Hospital", 8), ("Ramavarappadu Ring", "Airport (Gannavaram)", 15),
            ("Ramavarappadu Ring", "Auto Nagar", 7), ("Auto Nagar", "Airport (Gannavaram)", 12),
            ("Government Hospital", "Control Room", 5)
        ]

    elif city_name == "Hyderabad":
        nodes = {
            "Charminar": (17.3616, 78.4747),
            "Golconda Fort": (17.3833, 78.4011),
            "Hitech City": (17.4435, 78.3772),
            "Secunderabad Station": (17.4399, 78.5016),
            "RGIA Airport": (17.2403, 78.4294),
            "Hussain Sagar": (17.4239, 78.4738),
            "Banjara Hills": (17.4138, 78.4390),
            "Jubilee Hills": (17.4326, 78.4071),
            "Osmania Hospital": (17.3713, 78.4739), # Critical Medical Node
            "Gachibowli Stadium": (17.4452, 78.3499)
        }
        edges = [
            ("Charminar", "Osmania Hospital", 5), ("Charminar", "Hussain Sagar", 15),
            ("Hussain Sagar", "Secunderabad Station", 10), ("Hussain Sagar", "Banjara Hills", 8),
            ("Banjara Hills", "Jubilee Hills", 6), ("Jubilee Hills", "Hitech City", 7),
            ("Hitech City", "Gachibowli Stadium", 5), ("Hitech City", "Golconda Fort", 12),
            ("Golconda Fort", "Banjara Hills", 15), ("RGIA Airport", "Hussain Sagar", 40),
            ("RGIA Airport", "Charminar", 30), ("Secunderabad Station", "Osmania Hospital", 18)
        ]
        
    elif city_name == "Visakhapatnam":
        nodes = {
            "RK Beach": (17.7161, 83.3304),
            "Kailasagiri": (17.7492, 83.3423),
            "Jagadamba Junction": (17.7118, 83.3006),
            "Vizag Airport": (17.7211, 83.2245),
            "Simhachalam Temple": (17.7663, 83.2505),
            "Gajuwaka": (17.6908, 83.2117),
            "Dwaraka Nagar": (17.7295, 83.3006)
        }
        edges = [
            ("RK Beach", "Jagadamba Junction", 5), ("Jagadamba Junction", "Dwaraka Nagar", 6),
            ("Dwaraka Nagar", "Kailasagiri", 12), ("Dwaraka Nagar", "Gajuwaka", 15),
            ("Gajuwaka", "Vizag Airport", 8), ("Vizag Airport", "Dwaraka Nagar", 18),
            ("Simhachalam Temple", "Dwaraka Nagar", 20)
        ]

    for node, pos in nodes.items():
        G.add_node(node, pos=pos)

    for u, v, w in edges:
        lat1, lon1 = nodes[u]
        lat2, lon2 = nodes[v]
        R = 6371 
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        dist_km = R * c
        
        G.add_edge(u, v, weight=w, distance=round(dist_km, 2), base_weight=w)

    return G

def update_graph_weather_traffic(G, api_wrapper=None):
    """
    Updates graph using external API wrapper if valid.
    """
    pass

