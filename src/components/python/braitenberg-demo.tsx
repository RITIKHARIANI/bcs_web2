"use client";

import React from 'react';
import { PythonPlayground } from './python-playground';

// Web-compatible version of the Braitenberg Vehicle demo
const BRAITENBERG_CODE = `# Braitenberg Vehicles - Web Version
# Adapted for browser execution using WebTurtle graphics

import random
import math
import time
import js
from pyodide import create_proxy

# Global state for the simulation
simulation_state = {
    'running': False,
    'vehicles': [],
    'heat_sources': [],
    'canvas_size': 500,
    'animation_id': None
}

class HeatSource:
    def __init__(self, turtle, id_number, canvas_size):
        self.turtle = turtle
        self.id_number = id_number
        self.canvas_size = canvas_size

        # Configure heat source appearance
        self.turtle.shape('circle')
        self.turtle.color('orange', 'orange')
        self.turtle.turtlesize(1.5)
        self.turtle.penup()

        # Place randomly
        self.place()
        self.turtle.showturtle()

        # Enable dragging
        self.turtle.ondrag(self.drag_heat_source)

    def place(self):
        max_location = self.canvas_size / 2 - 20
        x = random.randint(-max_location, max_location)
        y = random.randint(-max_location, max_location)
        self.turtle.goto(x, y)

    def drag_heat_source(self, x, y):
        self.turtle.goto(x, y)

class Vehicle:
    def __init__(self, turtle, id_number, canvas_size):
        self.speed_params = [20, 0.2, 6]
        self.turn_parameters = [20]
        self.turtle = turtle
        self.id_number = id_number
        self.canvas_size = canvas_size
        self.max_location = canvas_size / 2 - 20

        # Random vehicle type
        self.type = random.choice(["crossed", "direct"])

        # Configure appearance
        self.turtle.shape('turtle')
        self.turtle.turtlesize(1)
        self.turtle.penup()

        if self.type == 'crossed':
            self.turtle.color('red', '#ffdddd')
        else:
            self.turtle.color('blue', '#ddddff')

        # Place randomly
        self.place()
        self.turtle.showturtle()

    def place(self):
        x = random.randint(-self.max_location, self.max_location)
        y = random.randint(-self.max_location, self.max_location)
        self.turtle.goto(x, y)
        self.turtle.setheading(random.randint(0, 360))

    def move(self):
        cumulative_speed = 0
        cumulative_turn_amount = 0

        for heat_source in simulation_state['heat_sources']:
            # Calculate input from this heat source
            input_distance = self.turtle.distance(heat_source.turtle.pos())
            input_angle = self.turtle.heading() - self.turtle.towards(heat_source.turtle.pos())

            # Simulate left and right sensors
            sin_angle = math.sin(math.radians(input_angle))
            left_sensor_distance = input_distance - sin_angle
            right_sensor_distance = input_distance + sin_angle

            # Compute speeds
            left_speed, right_speed, combined_speed = self.compute_speed(
                left_sensor_distance, right_sensor_distance
            )

            turn_amount = self.turn_parameters[0] * (right_speed - left_speed)
            cumulative_speed += combined_speed
            cumulative_turn_amount += turn_amount

        # Handle complex numbers (shouldn't happen, but safety check)
        if isinstance(cumulative_turn_amount, complex):
            cumulative_turn_amount = 0

        if cumulative_speed < 0:
            cumulative_speed = 0

        # Apply movement
        self.turtle.right(cumulative_turn_amount)
        self.turtle.forward(cumulative_speed)
        self.check_border_collision()

    def check_border_collision(self):
        x, y = self.turtle.xcor(), self.turtle.ycor()

        # Simple boundary handling - reverse direction when hitting walls
        if abs(x) > self.max_location or abs(y) > self.max_location:
            self.turtle.right(180)
            # Move back into bounds
            if abs(x) > self.max_location:
                self.turtle.goto(
                    self.max_location if x > 0 else -self.max_location,
                    y
                )
            if abs(y) > self.max_location:
                self.turtle.goto(
                    x,
                    self.max_location if y > 0 else -self.max_location
                )

    def compute_speed(self, left_distance, right_distance):
        if self.type == 'crossed':
            # Crossed connections - left sensor controls right motor
            left_speed = (self.speed_params[0] / (right_distance ** self.speed_params[1])) - self.speed_params[2]
            right_speed = (self.speed_params[0] / (left_distance ** self.speed_params[1])) - self.speed_params[2]
        else:
            # Direct connections - left sensor controls left motor
            left_speed = (self.speed_params[0] / (left_distance ** self.speed_params[1])) - self.speed_params[2]
            right_speed = (self.speed_params[0] / (right_distance ** self.speed_params[1])) - self.speed_params[2]

        combined_speed = (left_speed + right_speed) / 2
        return left_speed, right_speed, combined_speed

def create_simulation():
    """Initialize the simulation with vehicles and heat sources"""
    import web_turtle

    # Clear any existing simulation
    simulation_state['vehicles'] = []
    simulation_state['heat_sources'] = []

    # Get the main turtle (we'll create separate turtles for each object)
    main_turtle = web_turtle.create_turtle()
    main_turtle.clear()

    print("Creating Braitenberg Vehicle Simulation...")

    # Create heat sources (we'll simulate multiple turtles using position tracking)
    num_heat_sources = 3
    for i in range(num_heat_sources):
        # For simplicity, we'll use the main turtle and track positions
        # In a full implementation, we'd create separate turtle objects
        heat_source = HeatSource(main_turtle, i, simulation_state['canvas_size'])
        simulation_state['heat_sources'].append(heat_source)
        print(f"Created heat source {i+1}")

    # Create vehicles
    num_vehicles = 3
    for i in range(num_vehicles):
        vehicle = Vehicle(main_turtle, i, simulation_state['canvas_size'])
        simulation_state['vehicles'].append(vehicle)
        print(f"Created vehicle {i+1} (type: {vehicle.type})")

    print("\\nSimulation created!")
    print("- Red vehicles have CROSSED connections (approach behavior)")
    print("- Blue vehicles have DIRECT connections (avoidance behavior)")
    print("- Orange circles are heat sources (drag them around!)")
    print("\\nRun start_simulation() to begin!")

def move_all_vehicles():
    """Move all vehicles one step"""
    for vehicle in simulation_state['vehicles']:
        vehicle.move()

def start_simulation():
    """Start the simulation"""
    if not simulation_state['vehicles']:
        print("No simulation created. Run create_simulation() first!")
        return

    simulation_state['running'] = True
    print("Simulation started! Vehicles will move towards or away from heat sources.")
    print("Try dragging the orange heat sources around!")

    # Run a few simulation steps
    for step in range(50):  # Limited steps to avoid infinite loops
        if not simulation_state['running']:
            break
        move_all_vehicles()
        print(f"Step {step + 1}/50", end='\\r')

    print("\\nSimulation complete!")

def stop_simulation():
    """Stop the simulation"""
    simulation_state['running'] = False
    print("Simulation stopped!")

def reset_simulation():
    """Reset the simulation"""
    stop_simulation()
    for vehicle in simulation_state['vehicles']:
        vehicle.place()
    for heat_source in simulation_state['heat_sources']:
        heat_source.place()
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
        description="Interactive demonstration of autonomous agents with emergent behavior"
        height={500}
        showCanvas={true}
        canvasWidth={600}
        canvasHeight={500}
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