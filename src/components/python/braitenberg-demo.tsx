"use client";

import React from 'react';
import { PythonPlayground } from './python-playground';

// Web-compatible version of the Braitenberg Vehicle demo
const BRAITENBERG_CODE = `# Braitenberg Vehicles - Interactive Web Graphics Version
# Full visual implementation with moving vehicles and draggable heat sources

import random
import math
import turtle_graphics

# Global state for the simulation
simulation_state = {
    'running': False,
    'vehicles': {},  # Dict of vehicle_id -> turtle instance
    'heat_sources': {},  # Dict of heat_source_id -> turtle instance
    'vehicle_data': {},  # Vehicle behavior data
    'step_count': 0,
    'animation_active': False
}

def create_simulation():
    """Initialize the simulation with visual vehicles and heat sources"""
    print("Creating Interactive Braitenberg Vehicle Simulation...")
    print("🎯 Full visual implementation with moving graphics!")

    # Clear any existing simulation
    turtle_graphics.clear_all()
    simulation_state['vehicles'] = {}
    simulation_state['heat_sources'] = {}
    simulation_state['vehicle_data'] = {}
    simulation_state['step_count'] = 0

    # Create visual heat sources (draggable orange circles)
    num_heat_sources = 3
    for i in range(num_heat_sources):
        heat_id = f"heat_{i}"
        x = random.randint(-200, 200)
        y = random.randint(-150, 150)

        # Create visual heat source
        heat_source = turtle_graphics.create_heat_source(heat_id, x, y)
        simulation_state['heat_sources'][heat_id] = heat_source
        print(f"🔥 Created draggable heat source {i+1} at ({x}, {y})")

    # Create visual vehicles with behavior
    num_vehicles = 4
    vehicle_types = ["crossed", "direct", "crossed", "direct"]

    for i in range(num_vehicles):
        vehicle_id = f"vehicle_{i}"
        vehicle_type = vehicle_types[i % len(vehicle_types)]
        x = random.randint(-150, 150)
        y = random.randint(-100, 100)
        heading = random.randint(0, 360)

        # Create visual vehicle
        vehicle = turtle_graphics.create_vehicle(vehicle_id, vehicle_type)
        vehicle.goto(x, y)
        vehicle.setheading(heading)

        # Store vehicle and its behavioral data
        simulation_state['vehicles'][vehicle_id] = vehicle
        simulation_state['vehicle_data'][vehicle_id] = {
            'type': vehicle_type,
            'speed_params': [15, 0.3, 3],  # base_speed, distance_factor, threshold
            'turn_params': [8],  # turn_sensitivity
            'sensor_range': 200,
            'max_speed': 3
        }

        color = "red" if vehicle_type == "crossed" else "blue"
        print(f"🚗 Created {color} vehicle {i+1} (type: {vehicle_type}) at ({x}, {y})")

    print("\\n✅ Interactive simulation created!")
    print("🔴 Red vehicles: CROSSED connections (attraction/approach behavior)")
    print("🔵 Blue vehicles: DIRECT connections (avoidance behavior)")
    print("🟠 Orange circles: Draggable heat sources (try dragging them!)")
    print("\\n🎮 Controls:")
    print("- start_visual_simulation() - Start animated simulation")
    print("- stop_simulation() - Stop animation")
    print("- step_simulation() - Move one step manually")

def distance(x1, y1, x2, y2):
    """Calculate distance between two points"""
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def get_sensor_readings(vehicle_turtle, vehicle_data):
    """Get left and right sensor readings for a vehicle"""
    vehicle_pos = vehicle_turtle.pos()
    vehicle_heading = vehicle_turtle.heading()

    # Calculate sensor positions (offset from vehicle center)
    sensor_offset = 8
    left_angle = math.radians(vehicle_heading + 45)  # Left sensor 45° left
    right_angle = math.radians(vehicle_heading - 45)  # Right sensor 45° right

    left_sensor_x = vehicle_pos[0] + sensor_offset * math.cos(left_angle)
    left_sensor_y = vehicle_pos[1] + sensor_offset * math.sin(left_angle)
    right_sensor_x = vehicle_pos[0] + sensor_offset * math.cos(right_angle)
    right_sensor_y = vehicle_pos[1] + sensor_offset * math.sin(right_angle)

    # Calculate total sensor activation from all heat sources
    left_activation = 0
    right_activation = 0

    for heat_source in simulation_state['heat_sources'].values():
        heat_pos = heat_source.pos()

        # Distance from sensors to heat source
        left_dist = distance(left_sensor_x, left_sensor_y, heat_pos[0], heat_pos[1])
        right_dist = distance(right_sensor_x, right_sensor_y, heat_pos[0], heat_pos[1])

        # Convert distance to activation (closer = higher activation)
        sensor_range = vehicle_data['sensor_range']
        if left_dist < sensor_range:
            left_activation += max(0, (sensor_range - left_dist) / sensor_range)
        if right_dist < sensor_range:
            right_activation += max(0, (sensor_range - right_dist) / sensor_range)

    # Add small random noise to sensors
    left_activation += random.uniform(-0.1, 0.1)
    right_activation += random.uniform(-0.1, 0.1)

    return max(0, left_activation), max(0, right_activation)

def move_vehicle(vehicle_id):
    """Move a single vehicle based on Braitenberg logic"""
    vehicle = simulation_state['vehicles'][vehicle_id]
    vehicle_data = simulation_state['vehicle_data'][vehicle_id]

    # Get sensor readings
    left_activation, right_activation = get_sensor_readings(vehicle, vehicle_data)

    # Calculate motor speeds based on vehicle type
    base_speed = vehicle_data['speed_params'][0]

    if vehicle_data['type'] == 'crossed':
        # Crossed connections: left sensor -> right motor, right sensor -> left motor
        left_motor = base_speed * right_activation
        right_motor = base_speed * left_activation
    else:
        # Direct connections: left sensor -> left motor, right sensor -> right motor
        left_motor = base_speed * left_activation
        right_motor = base_speed * right_activation

    # Calculate movement
    avg_speed = (left_motor + right_motor) / 2
    turn_amount = vehicle_data['turn_params'][0] * (right_motor - left_motor)

    # Apply speed limits
    avg_speed = min(avg_speed, vehicle_data['max_speed'])
    turn_amount = max(-30, min(30, turn_amount))  # Limit turning

    # Move the vehicle
    if avg_speed > 0.1:  # Only move if there's significant speed
        vehicle.right(turn_amount)
        vehicle.forward(avg_speed)

    # Keep within canvas bounds
    pos = vehicle.pos()
    if abs(pos[0]) > 280 or abs(pos[1]) > 180:
        # Turn around if hitting boundary
        vehicle.right(random.randint(120, 240))

def move_all_vehicles():
    """Move all vehicles one step"""
    simulation_state['step_count'] += 1

    for vehicle_id in simulation_state['vehicles']:
        move_vehicle(vehicle_id)

def step_simulation():
    """Manually advance simulation by one step"""
    if not simulation_state['vehicles']:
        print("❌ No simulation created. Run create_simulation() first!")
        return

    move_all_vehicles()
    print(f"📈 Step {simulation_state['step_count']} completed")

def animation_step():
    """Single animation frame - called by the animation loop"""
    if simulation_state['running'] and simulation_state['animation_active']:
        move_all_vehicles()

        # Continue animation
        if simulation_state['running']:
            # Schedule next frame (approximately 60 FPS)
            pass  # The animation loop in turtle_graphics handles this

def start_visual_simulation():
    """Start the animated visual simulation"""
    if not simulation_state['vehicles']:
        print("❌ No simulation created. Run create_simulation() first!")
        return

    if simulation_state['running']:
        print("⚠️ Simulation already running!")
        return

    simulation_state['running'] = True
    simulation_state['animation_active'] = True

    print("🎬 Starting animated simulation...")
    print("🎮 Try dragging the orange heat sources while vehicles are moving!")
    print("⏹️ Use stop_simulation() to stop")

    # Create animation callback function
    def animation_callback():
        if simulation_state['running'] and simulation_state['animation_active']:
            move_all_vehicles()

    # Register the animation callback with the graphics system
    turtle_graphics.set_animation_callback(animation_callback)

    # Start the animation loop
    turtle_graphics.start_animation()

def stop_simulation():
    """Stop the simulation"""
    simulation_state['running'] = False
    simulation_state['animation_active'] = False
    turtle_graphics.stop_animation()
    print("⏹️ Simulation stopped!")

def reset_simulation():
    """Reset the simulation with new random positions"""
    stop_simulation()
    print("🔄 Resetting simulation...")
    create_simulation()

def clear_simulation():
    """Clear all graphics and reset"""
    stop_simulation()
    turtle_graphics.clear_all()
    simulation_state['vehicles'] = {}
    simulation_state['heat_sources'] = {}
    simulation_state['vehicle_data'] = {}
    simulation_state['step_count'] = 0
    print("🧹 Simulation cleared!")

def print_help():
    """Show available commands"""
    print("\\n🎮 Braitenberg Vehicle Simulation Commands:")
    print("================================")
    print("🎬 start_visual_simulation() - Start animated simulation")
    print("⏹️ stop_simulation() - Stop animation")
    print("📈 step_simulation() - Move one step manually")
    print("🔄 reset_simulation() - Reset with new positions")
    print("🧹 clear_simulation() - Clear all graphics")
    print("❓ print_help() - Show this help")
    print("\\n🎯 Interactive Features:")
    print("• Drag orange heat sources with your mouse")
    print("• Watch vehicles respond in real-time")
    print("• Red vehicles are attracted, blue vehicles avoid")

# Initialize the simulation
create_simulation()

print("\\n🎉 Interactive Braitenberg Vehicle Simulation Ready!")
print("\\n🚀 Quick Start: start_visual_simulation()")
print("❓ Need help? Run: print_help()")`;

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
        description="Interactive visual demonstration of autonomous agents with emergent behavior"
        height={500}
        showCanvas={true}
        canvasWidth={600}
        canvasHeight={400}
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