import unittest
import sys
import os
import networkx as nx

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.city_graph import create_city_graph
from backend.classical_solver import solve_classical
from quantum.qaoa_solver import QAOASolver

class TestEmergencyRouting(unittest.TestCase):
    
    def setUp(self):
        self.G = create_city_graph()
        self.source = "Downtown"
        self.target = "Airport"
        
    def test_graph_structure(self):
        self.assertTrue(len(self.G.nodes) > 0)
        self.assertTrue(len(self.G.edges) > 0)
        self.assertIn("Downtown", self.G.nodes)
        
    def test_classical_solver(self):
        res = solve_classical(self.G, self.source, self.target)
        self.assertIsNotNone(res)
        self.assertIn("path", res)
        self.assertEqual(res["path"][0], self.source)
        self.assertEqual(res["path"][-1], self.target)
        
    def test_quantum_solver(self):
        qaoa = QAOASolver(self.G, self.source, self.target)
        res = qaoa.solve()
        self.assertIsNotNone(res)
        self.assertIn("path", res)
        self.assertEqual(res["path"][0], self.source)
        self.assertEqual(res["path"][-1], self.target)

if __name__ == '__main__':
    unittest.main()
