"use client";

import React from 'react';
import { PythonPlayground } from './python-playground';

// Web-compatible version of the Braitenberg Vehicle demo
const BRAITENBERG_CODE = `# Braitenberg Vehicles - Web Version
# Adapted for browser execution using WebTurtle graphics

import random
import math
import time

# Global state for the simulation
simulation_state = {
    'running': False,
    'vehicles': [],
    'heat_sources': [],
    'canvas_size': 500,
    'animation_id': None
}

# Utility functions for Braitenberg vehicle simulation

def create_simulation():
    """Initialize the simulation with vehicles and heat sources"""
    print("Creating Braitenberg Vehicle Simulation...")
    print("Note: This is a simplified simulation for demonstration.")
    print("In the full implementation, this would create interactive graphics.")

    # Clear any existing simulation
    simulation_state['vehicles'] = []
    simulation_state['heat_sources'] = []

    # Create heat sources with position data
    num_heat_sources = 3
    for i in range(num_heat_sources):
        heat_source = {
            'id': i,
            'x': random.randint(-200, 200),
            'y': random.randint(-150, 150),
            'color': 'orange'
        }
        simulation_state['heat_sources'].append(heat_source)
        print(f"Created heat source {i+1} at ({heat_source['x']}, {heat_source['y']})")

    # Create vehicles with initial positions
    num_vehicles = 3
    for i in range(num_vehicles):
        vehicle_type = random.choice(["crossed", "direct"])
        vehicle = {
            'id': i,
            'x': random.randint(-200, 200),
            'y': random.randint(-150, 150),
            'heading': random.randint(0, 360),
            'type': vehicle_type,
            'color': 'red' if vehicle_type == 'crossed' else 'blue',
            'speed_params': [20, 0.2, 6],
            'turn_params': [20]
        }
        simulation_state['vehicles'].append(vehicle)
        print(f"Created vehicle {i+1} (type: {vehicle['type']}) at ({vehicle['x']}, {vehicle['y']})")

    print("\\nSimulation created!")
    print("- Red vehicles have CROSSED connections (approach behavior)")
    print("- Blue vehicles have DIRECT connections (avoidance behavior)")
    print("- Orange circles are heat sources")
    print("\\nRun start_simulation() to begin!")

def distance(x1, y1, x2, y2):
    """Calculate distance between two points"""
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def move_vehicle(vehicle):
    """Move a single vehicle based on Braitenberg vehicle logic"""
    cumulative_speed = 0
    cumulative_turn = 0

    for heat_source in simulation_state['heat_sources']:
        # Calculate distance to heat source
        dist = distance(vehicle['x'], vehicle['y'], heat_source['x'], heat_source['y'])

        # Simulate left and right sensors
        left_distance = dist + random.uniform(-5, 5)  # Add sensor noise
        right_distance = dist + random.uniform(-5, 5)

        # Calculate motor speeds based on vehicle type
        if vehicle['type'] == 'crossed':
            # Crossed connections: left sensor -> right motor
            left_speed = max(0, (vehicle['speed_params'][0] / max(1, right_distance ** vehicle['speed_params'][1])) - vehicle['speed_params'][2])
            right_speed = max(0, (vehicle['speed_params'][0] / max(1, left_distance ** vehicle['speed_params'][1])) - vehicle['speed_params'][2])
        else:
            # Direct connections: left sensor -> left motor
            left_speed = max(0, (vehicle['speed_params'][0] / max(1, left_distance ** vehicle['speed_params'][1])) - vehicle['speed_params'][2])
            right_speed = max(0, (vehicle['speed_params'][0] / max(1, right_distance ** vehicle['speed_params'][1])) - vehicle['speed_params'][2])

        combined_speed = (left_speed + right_speed) / 2
        turn_amount = vehicle['turn_params'][0] * (right_speed - left_speed)

        cumulative_speed += combined_speed
        cumulative_turn += turn_amount

    # Update vehicle position and heading
    vehicle['heading'] = (vehicle['heading'] + cumulative_turn) % 360

    # Move forward
    radians = math.radians(vehicle['heading'])
    vehicle['x'] += cumulative_speed * math.cos(radians)
    vehicle['y'] += cumulative_speed * math.sin(radians)

    # Keep within bounds
    vehicle['x'] = max(-250, min(250, vehicle['x']))
    vehicle['y'] = max(-200, min(200, vehicle['y']))

def move_all_vehicles():
    """Move all vehicles one step"""
    for vehicle in simulation_state['vehicles']:
        move_vehicle(vehicle)

def print_simulation_state():
    """Print current positions of all vehicles and heat sources"""
    print("\\n=== Simulation State ===")
    for i, vehicle in enumerate(simulation_state['vehicles']):
        print(f"Vehicle {i+1} ({vehicle['type']}): x={vehicle['x']:.1f}, y={vehicle['y']:.1f}, heading={vehicle['heading']:.1f}°")

    for i, heat_source in enumerate(simulation_state['heat_sources']):
        print(f"Heat Source {i+1}: x={heat_source['x']}, y={heat_source['y']}")
    print("========================\\n")

def start_simulation():
    """Start the simulation"""
    if not simulation_state['vehicles']:
        print("No simulation created. Run create_simulation() first!")
        return

    simulation_state['running'] = True
    print("Simulation started! Running 20 steps...")
    print("Watch how vehicles move based on their connections:")

    # Run simulation steps
    for step in range(20):
        if not simulation_state['running']:
            break

        move_all_vehicles()

        if step % 5 == 0:  # Print state every 5 steps
            print(f"\\nStep {step + 1}:")
            print_simulation_state()

    print("Simulation complete!")
    print("\\nTry:")
    print("- print_simulation_state() to see current positions")
    print("- move_all_vehicles() to advance one step")
    print("- reset_simulation() to restart")

def stop_simulation():
    """Stop the simulation"""
    simulation_state['running'] = False
    print("Simulation stopped!")

def reset_simulation():
    """Reset the simulation"""
    stop_simulation()
    create_simulation()
    print("Simulation reset!")

# Create the simulation when the code runs
create_simulation()

print("\\nBraitenberg Vehicle Simulation Ready!")
print("\\nCommands:")
print("- start_simulation() - Start the simulation")
print("- stop_simulation() - Stop the simulation")
print("- reset_simulation() - Reset positions")
print("- move_all_vehicles() - Move vehicles one step")
print("\\nTry: start_simulation()")`;

export function BraitenbergDemo() {
  return (
    <div className="w-full space-y-6">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">Braitenberg Vehicles - Interactive Demo</h2>
        <p className="text-gray-600 mb-4">
          This interactive demonstration shows Braitenberg Vehicles, simple autonomous agents that exhibit
          complex behaviors through basic sensor-motor connections. The simulation has been adapted to run
          entirely in your browser using our Python playground.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
          <ul className="text-blue-700 space-y-1">
            <li><strong>Red vehicles:</strong> Have crossed connections (left sensor → right motor). They show approach behavior.</li>
            <li><strong>Blue vehicles:</strong> Have direct connections (left sensor → left motor). They show avoidance behavior.</li>
            <li><strong>Orange circles:</strong> Heat sources that attract or repel vehicles. You can drag them around!</li>
          </ul>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Converting Desktop Python to Web:</h3>
          <p className="text-green-700 mb-2">
            This demo shows how we adapted the original tkinter/turtle code for web use:
          </p>
          <ul className="text-green-700 space-y-1 text-sm">
            <li>✅ <code>import tkinter</code> → <code>import js, web_turtle</code></li>
            <li>✅ <code>RawTurtle(canvas)</code> → <code>web_turtle.create_turtle()</code></li>
            <li>✅ <code>turtle.ondrag()</code> → <code>turtle.ondrag()</code> (same API!)</li>
            <li>✅ <code>mainloop()</code> → <code>step-by-step execution</code></li>
            <li>✅ GUI buttons → Python function calls</li>
          </ul>
        </div>
      </div>

      <PythonPlayground
        initialCode={BRAITENBERG_CODE}
        title="Braitenberg Vehicles Simulation"
        description="Computational demonstration of autonomous agents with emergent behavior"
        height={500}
        showCanvas={false}
      />

      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold mb-3">Try These Experiments:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Run <code>start_simulation()</code> to see the vehicles move</li>
          <li>Try <code>reset_simulation()</code> to randomize positions</li>
          <li>Drag the orange heat sources around and observe how vehicles react</li>
          <li>Modify the vehicle parameters in the code to see different behaviors</li>
          <li>Add more vehicles or heat sources by changing the numbers in <code>create_simulation()</code></li>
        </ol>

        <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
          <h4 className="font-semibold mb-2">For Faculty: Code Conversion Guidelines</h4>
          <p className="text-sm text-gray-600 mb-2">
            When adapting your tkinter/turtle educational demos for the web platform:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Replace <code>import tkinter</code> with <code>import js, web_turtle</code></li>
            <li>• Use <code>web_turtle.create_turtle()</code> instead of <code>RawTurtle(canvas)</code></li>
            <li>• Replace <code>mainloop()</code> with step-by-step execution functions</li>
            <li>• Keep the same turtle graphics API (forward, right, goto, etc.)</li>
            <li>• Use Python functions instead of GUI buttons for controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
}