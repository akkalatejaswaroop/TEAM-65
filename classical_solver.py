import networkx as nx

def solve_classical(G, source, target):
    """
    Finds the shortest path using Dijkstra's algorithm.
    """
    try:
        # ⚠️ DEMO LOGIC: Simulating "Standard" vs "Optimized"
        # The User wants the Classical Path to be LONGER than the Quantum Path.
        # Quantum (Best) = Shortest.
        # Classical (Standard) = 2nd Best (e.g. sticks to main roads / stale data).
        
        # We generate 2 shortest paths
        import itertools
        generator = nx.shortest_simple_paths(G, source, target, weight='weight')
        
        # Get top 2
        try:
            # We slice the generator safely
            paths = list(itertools.islice(generator, 2))
            
            # Technical Honesty: We pick the actual shortest path.
            # Quantum Advantage comes from Signal Optimization (Green Wave), not route difference.
            if paths:
                path = paths[0]
            else:
                 path = nx.dijkstra_path(G, source, target, weight='weight')
        except Exception:
             # Fallback
             path = nx.dijkstra_path(G, source, target, weight='weight')

        length = 0
        total_dist = 0
        
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            # Sum up weights manually as we have the explicit path
            length += G[u][v].get('weight', 1)
            total_dist += G[u][v].get('distance', 0)
            
        return {
            "path": path,
            "eta": round(length, 2),
            "distance": round(total_dist, 2),
            "method": "Classical (Standard GPS)"
        }
    except nx.NetworkXNoPath:
        return None
