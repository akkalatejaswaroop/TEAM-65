import streamlit as st
import sys
import os
import pandas as pd
import plotly.express as px

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.city_graph import create_city_graph
from backend.traffic_model import predict_traffic, get_traffic_forecast

st.set_page_config(page_title="Traffic Dashboard", page_icon="📉", layout="wide")

st.title("📉 Real-Time Traffic Analytics")
st.markdown("### Vijayawada City Grid Status")

# Load Data
if 'graph' not in st.session_state:
    st.session_state.graph = create_city_graph()
G = st.session_state.graph

# Refresh Button
if st.button("🔄 Refresh Live Data"):
    st.rerun()

# Get Data
G_traffic, stats = predict_traffic(G, "Custom") # Use generic type for overview

# 1. KPI Metrics
total_roads = G.number_of_edges()
congested_roads = sum(1 for d in stats.values() if d['status'] == 'High')
avg_congestion = sum(d['predicted']/d['base'] for d in stats.values()) / total_roads

k1, k2, k3 = st.columns(3)
with k1: st.metric("Active Hotspots", f"{congested_roads} / {total_roads}", delta="High Priority", delta_color="inverse")
with k2: st.metric("Avg Congestion Index", f"{avg_congestion:.2f}x", delta="Above Normal")
with k3: st.metric("Sensor Status", "Online", delta="100% Uptime")

st.markdown("---")

# 2. Forecast Chart
st.subheader("🔮 60-Minute Congestion Forecast")
forecast = get_traffic_forecast(G, "Custom")
df_forecast = pd.DataFrame(forecast)
st.line_chart(df_forecast.set_index('time'), height=300)

# 3. Detailed Road Status
st.subheader("🚦 Road Segment Status")
rows = []
for (u, v), data in stats.items():
    rows.append({
        "From": u, "To": v, 
        "Status": data['status'], 
        "Base Time": f"{data['base']} min",
        "Current Time": f"{data['predicted']} min",
        "Load Factor": round(data['predicted']/data['base'], 2)
    })
df_roads = pd.DataFrame(rows)

# Color coding for dataframe
def color_status(val):
    color = 'green' if val == 'Low' else 'orange' if val == 'Medium' else 'red'
    return f'color: {color}; font-weight: bold'

st.dataframe(df_roads.style.applymap(color_status, subset=['Status']), use_container_width=True)
