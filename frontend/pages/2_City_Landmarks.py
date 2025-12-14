import streamlit as st
import sys
import os
import networkx as nx

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.city_graph import create_city_graph
from backend.traffic_model import predict_traffic

st.set_page_config(page_title="City Landmarks", page_icon="🏛️", layout="wide")

st.title("🏛️ City Landmarks & Navigation")
# City Selection Locked
selected_city = "Vijayawada"

st.markdown(f"### Explore Key Locations in {selected_city}")

# Update Graph if City Changed or Graph Missing
if 'current_city' not in st.session_state or st.session_state.current_city != selected_city or 'graph' not in st.session_state:
    st.session_state.current_city = selected_city
    st.session_state.graph = create_city_graph(selected_city)
    st.toast(f"Switched to {selected_city}")

G = st.session_state.graph

# Get current traffic for "Accessibility" score
G_traffic, stats = predict_traffic(G, "Custom")

# Layout
col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Select Landmark")
    nodes = list(G.nodes())
    selected_node = st.radio("Locations", nodes)

with col2:
    st.subheader(f"📍 {selected_node}")
    
    # Calculate Metrics
    # Connectivity: Degree
    degree = G.degree[selected_node]
    
    # Accessibility: Avg time of incoming edges
    incoming_edges = G_traffic.edges(selected_node, data=True)
    avg_time = sum(d['weight'] for u, v, d in incoming_edges) / len(incoming_edges) if incoming_edges else 0
    
    m1, m2 = st.columns(2)
    with m1: st.metric("Connectivity", f"{degree} Roads")
    with m2: st.metric("Avg Access Time", f"{avg_time:.1f} min")
    
    st.markdown("#### Connected Roads Status")
    for u, v, d in incoming_edges:
        neighbor = v if u == selected_node else u
        status = d.get('congestion_level', 'Low')
        icon = "🟢" if status == 'Low' else "🟠" if status == 'Medium' else "🔴"
        st.write(f"{icon} **To/From {neighbor}**: {d['weight']} min ({status})")
        
    st.markdown("---")
    if st.button(f"🚑 Navigate to {selected_node}"):
        st.session_state.nav_target = selected_node
        st.switch_page("Home.py")
