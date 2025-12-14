import streamlit as st
import sys
import os
import pandas as pd
import folium
from streamlit_folium import st_folium

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.location_services import LocationServices

st.set_page_config(page_title="Asset Tracker", page_icon="🛰️", layout="wide")

st.title("🛰️ Live Asset Tracking & Geofencing")
st.markdown("### Monitor Emergency Fleet Real-Time")

loc = LocationServices()

# --- SIDEBAR CONFIG ---
with st.sidebar:
    st.header("Geofence Configurations")
    # Default Center (Benz Circle approx)
    fence_lat = st.number_input("Zone Center Lat", value=16.5003, format="%.4f")
    fence_lon = st.number_input("Zone Center Lon", value=80.6534, format="%.4f")
    fence_radius = st.slider("Zone Radius (km)", 0.5, 10.0, 3.0, 0.1)
    
    st.markdown("---")
    if st.button("🔄 Refresh Satellite Uplink"):
        st.rerun()

# --- ASSET DATA ---
assets = loc.track_assets()
df_assets = pd.DataFrame(assets)

# Asset Metrics
c1, c2, c3, c4 = st.columns(4)
active_count = sum(1 for a in assets if a['status'] != 'Idle')
with c1: st.metric("Total Fleet", len(assets))
with c2: st.metric("Active Units", active_count, delta="Online")
with c3: st.metric("Monitoring Zone", f"{fence_radius} km", help="Geofence Radius")
with c4: st.metric("System Status", "Live", delta_color="normal")

st.markdown("---")

# --- TABS FOR OPERATIONS ---
tab_map, tab_comms = st.tabs(["🗺️ Live Map", "💬 Fleet Command"])

with tab_map:
    # --- GEOSPATIAL VISUALIZATION ---
    # Create Folium Map
    center = [16.505, 80.650] # Vijayawada General
    m = folium.Map(location=center, zoom_start=13, tiles='CartoDB dark_matter')
    
    # 1. Draw Geofence (Circle)
    folium.Circle(
        location=[fence_lat, fence_lon],
        radius=fence_radius * 1000, # Meters
        color='#00ff00',
        fill=True,
        fill_color='#00ff00',
        fill_opacity=0.1,
        popup="Safe Zone",
        tooltip="Geofence Boundary"
    ).add_to(m)
    
    # 2. Draw Center Marker
    folium.Marker(
        [fence_lat, fence_lon],
        popup="Zone Center",
        icon=folium.Icon(color='green', icon='crosshairs', prefix='fa')
    ).add_to(m)
    
    # 3. Draw Assets
    for asset in assets:
        # Check Geofence Logic
        is_inside, dist = loc.check_geofence((asset['lat'], asset['lon']), (fence_lat, fence_lon), fence_radius)
        
        # Icon Selection
        if asset['type'] == 'Ambulance': icon_name = 'ambulance'
        elif 'Fire' in asset['type']: icon_name = 'fire-extinguisher'
        elif 'Aerial' in asset['type']: icon_name = 'plane'
        elif 'Transport' in asset['type']: icon_name = 'heartbeat'
        else: icon_name = 'shield'
        
        color = 'blue' if is_inside else 'red' # Red if outside zone!
        
        # Tooltip Info
        tooltip_txt = f"{asset['id']} ({asset['type']})"
        popup_txt = f"""
        <b>ID:</b> {asset['id']}<br>
        <b>Type:</b> {asset['type']}<br>
        <b>Status:</b> {asset['status']}<br>
        <b>Speed:</b> {asset['speed']} km/h<br>
        <b>Zone:</b> {'INSIDE' if is_inside else 'OUTSIDE'} ({dist:.2f} km)
        """
        
        folium.Marker(
            [asset['lat'], asset['lon']],
            popup=popup_txt,
            tooltip=tooltip_txt,
            icon=folium.Icon(color=color, icon=icon_name, prefix='fa')
        ).add_to(m)
    
    # Layout: Map + Alert Column
    c_map, c_info = st.columns([3, 1])
    
    with c_map:
        st_folium(m, width="100%", height=500)
        
    with c_info:
        st.subheader("⚠️ Alert Feed")
        violations = []
        for asset in assets:
            inside, dist = loc.check_geofence((asset['lat'], asset['lon']), (fence_lat, fence_lon), fence_radius)
            if not inside:
                violations.append(asset)
                st.error(f"🚨 **{asset['id']}**\nOUTSIDE ZONE (+{dist-fence_radius:.1f}km)")
                
        if not violations:
            st.success("✅ All systems nominal.")
            
        st.markdown("---")
        st.caption(f"Tracking {len(assets)} active units.")

with tab_comms:
    st.markdown("### 📡 Secure Frequency Channels")
    
    # Layout: Unit Selector (Left) | Chat/Voice Interface (Right)
    col_list, col_chat = st.columns([1, 2])
    
    with col_list:
        st.markdown("**Select Unit:**")
        
        # Helper to set active unit
        def set_unit(uid):
            st.session_state.active_unit = uid
            
        if 'active_unit' not in st.session_state:
            st.session_state.active_unit = assets[0]['id']
            
        for a in assets:
            if st.button(f"{a['id']} | {a['type']}", key=f"btn_{a['id']}", use_container_width=True):
                set_unit(a['id'])
                
    with col_chat:
        target_id = st.session_state.active_unit
        target_asset = next((a for a in assets if a['id'] == target_id), None)
        
        if target_asset:
            st.markdown(f"#### 🟢 Connected: {target_id} ({target_asset['type']})")
            st.caption(f"Signal Strength: 98% | Latency: 12ms | Status: {target_asset['status']}")
            
            # Chat History Simulation
            with st.container(border=True, height=300):
                st.markdown(f"**[SYSTEM 01:42]:** Handshake established with {target_id}.")
                if target_asset['status'] == 'Idle':
                    st.markdown(f"**[{target_id}]:** Standing by at base. Ready for instructions.")
                elif 'Fire' in target_asset['type']:
                     st.markdown(f"**[{target_id}]:** En route to Sector 4. Water pressure nominal.")
                else:
                     st.markdown(f"**[{target_id}]:** Patrol active. Current speed {target_asset['speed']} km/h.")
                     
                if 'last_msg' in st.session_state and st.session_state.last_msg_target == target_id:
                     st.markdown(f"**[DISPATCH]:** {st.session_state.last_msg}")
                     st.markdown(f"**[{target_id}]:** Copy that. Executing.")
            
            # Input Controls
            col_txt, col_mic = st.columns([4, 1])
            with col_txt:
                msg = st.text_input("Message", placeholder="Type commands...", label_visibility="collapsed")
            with col_mic:
                if st.button("🎤 PTT", type="primary", use_container_width=True, help="Push-to-Talk (Voice)"):
                     st.toast(f"🎙️ Broadcasting to {target_id}...")
                     time.sleep(1)
                     st.toast("✅ Transmission Received")
            
            if st.button("📨 Send Text"):
                if msg:
                    st.session_state.last_msg = msg
                    st.session_state.last_msg_target = target_id
                    st.toast(f"Message sent to {target_id}")
                    st.rerun()
                else:
                    st.warning("Enter a message first.")
                    
        else:
             st.error("Connection Lost. Select a unit.")

# Quick Table View at bottom
with st.expander("📋 Full Fleet Manifest", expanded=False):
     st.dataframe(df_assets, use_container_width=True, hide_index=True)
