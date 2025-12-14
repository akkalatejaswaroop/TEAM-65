import streamlit as st
import sys
import os

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from quantum.qaoa_solver import QAOASolver
from backend.city_graph import create_city_graph

st.set_page_config(page_title="Quantum Lab", page_icon="⚛️", layout="wide")

st.title("⚛️ Quantum Research Lab")
st.markdown("### Deep Dive into QAOA & Circuit Logic")

st.info("This section provides transparency into the Quantum Approximate Optimization Algorithm (QAOA) used in the backend.")

tab1, tab2, tab3 = st.tabs(["Algorithm Theory", "Circuit Visualizer", "Hardware Specs"])

with tab1:
    st.markdown("""
    ### The QAOA Approach
    The **Quantum Approximate Optimization Algorithm** is a hybrid quantum-classical algorithm designed to solve combinatorial optimization problems.
    
    #### 1. Problem Mapping (Ising Model)
    We map the route optimization problem to a Hamiltonian $H_C$:
    $$ H_C = \\sum_{(u,v) \\in E} W_{uv} x_{uv} + \\lambda \\text{Constraints} $$
    
    #### 2. The Ansatz
    We apply a sequence of unitary gates:
    $$ |\\psi(\\gamma, \\beta)\\rangle = e^{-i \\beta H_M} e^{-i \\gamma H_C} |+\\rangle^{\\otimes n} $$
    
    #### 3. Measurement
    Measuring the state gives a bitstring $z$ which corresponds to a candidate path.
    """)

with tab2:
    st.subheader("Live Circuit Generation")
    
    # Dummy graph for visualization
    G = create_city_graph()
    solver = QAOASolver(G, "Benz Circle", "PVP Square")
    solver.calculate_qubits() # Prep candidates
    solver.solve() # Generate circuit
    
    st.markdown("**Generated Circuit Diagram (Cirq):**")
    st.code(solver.circuit, language="text")
    
    st.markdown(f"**Qubits Used:** {len(solver.qubits)}")
    st.markdown(f"**Circuit Depth:** {len(solver.circuit)}")

with tab3:
    st.subheader("Backend Specifications")
    st.json({
        "Backend": "Google Cirq Simulator",
        "Qubit Topology": "All-to-All Connectivity",
        "Gate Set": ["H", "Rz", "Rx", "CNOT", "Measure"],
        "Noise Model": "None (Ideal Simulation)",
        "Shots": 100
    })
