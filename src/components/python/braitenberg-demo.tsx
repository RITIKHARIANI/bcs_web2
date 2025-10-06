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
    'animation_active': False,
    'animation_callback': None  # Store the callback proxy
}

def check_graphics_ready():
    """Check if the graphics system is ready"""
    try:
        # Test if manager is available
        if hasattr(turtle_graphics, 'manager') and turtle_graphics.manager:
            return True
        return False
    except:
        return False

def create_simulation():
    """Initialize the simulation with visual vehicles and heat sources"""
    print("Creating Interactive Braitenberg Vehicle Simulation...")
    print("🎯 Full visual implementation with moving graphics!")

    # Check if graphics are ready
    graphics_ready = check_graphics_ready()
    if graphics_ready:
        print("✅ Graphics system is ready!")
    else:
        print("⚠️  Graphics system initializing...")

    # Clear any existing simulation
    try:
        if graphics_ready:
            turtle_graphics.clear_all()
    except Exception as e:
        print(f"⚠️  Canvas not fully ready yet: {e}")
        print("🔄 Graphics will initialize when you start the simulation")

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

        if graphics_ready:
            try:
                # Create visual heat source
                heat_source = turtle_graphics.create_heat_source(heat_id, x, y)
                simulation_state['heat_sources'][heat_id] = heat_source
                print(f"🔥 Created draggable heat source {i+1} at ({x}, {y})")
            except Exception as e:
                print(f"⚠️  Could not create heat source {i+1}: {e}")
                # Store placeholder data for computational simulation
                simulation_state['heat_sources'][heat_id] = {'x': x, 'y': y, 'id': heat_id}
        else:
            # Store placeholder data for computational simulation
            simulation_state['heat_sources'][heat_id] = {'x': x, 'y': y, 'id': heat_id}
            print(f"📊 Created heat source {i+1} data at ({x}, {y}) - graphics will load later")

    # Create visual vehicles with behavior
    num_vehicles = 4
    vehicle_types = ["crossed", "direct", "crossed", "direct"]

    for i in range(num_vehicles):
        vehicle_id = f"vehicle_{i}"
        vehicle_type = vehicle_types[i % len(vehicle_types)]
        x = random.randint(-150, 150)
        y = random.randint(-100, 100)
        heading = random.randint(0, 360)

        if graphics_ready:
            try:
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
            except Exception as e:
                print(f"⚠️  Could not create vehicle {i+1}: {e}")
                # Store placeholder data for computational simulation
                simulation_state['vehicles'][vehicle_id] = {'x': x, 'y': y, 'heading': heading, 'type': vehicle_type}
                simulation_state['vehicle_data'][vehicle_id] = {
                    'type': vehicle_type,
                    'speed_params': [15, 0.3, 3],
                    'turn_params': [8],
                    'sensor_range': 200,
                    'max_speed': 3
                }
        else:
            # Store placeholder data for computational simulation
            simulation_state['vehicles'][vehicle_id] = {'x': x, 'y': y, 'heading': heading, 'type': vehicle_type}
            simulation_state['vehicle_data'][vehicle_id] = {
                'type': vehicle_type,
                'speed_params': [15, 0.3, 3],
                'turn_params': [8],
                'sensor_range': 200,
                'max_speed': 3
            }
            color = "red" if vehicle_type == "crossed" else "blue"
            print(f"📊 Created {color} vehicle {i+1} data (type: {vehicle_type}) at ({x}, {y}) - graphics will load later")

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
    try:
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
            # Check if heat source is visual turtle or placeholder data
            if hasattr(heat_source, 'pos') and callable(heat_source.pos):
                heat_pos = heat_source.pos()
                heat_x, heat_y = heat_pos[0], heat_pos[1]
            else:
                # Placeholder data
                heat_x, heat_y = heat_source['x'], heat_source['y']

            # Distance from sensors to heat source
            left_dist = distance(left_sensor_x, left_sensor_y, heat_x, heat_y)
            right_dist = distance(right_sensor_x, right_sensor_y, heat_x, heat_y)

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
    except Exception as e:
        # Fallback to random values if there's any error
        return random.uniform(0, 0.5), random.uniform(0, 0.5)

def move_vehicle(vehicle_id):
    """Move a single vehicle based on Braitenberg logic"""
    vehicle = simulation_state['vehicles'][vehicle_id]
    vehicle_data = simulation_state['vehicle_data'][vehicle_id]

    # Check if this is a visual turtle or placeholder data
    # Visual turtles have pos() method, dictionaries have 'x' key
    is_visual_turtle = hasattr(vehicle, 'pos') and callable(vehicle.pos)
    is_placeholder_dict = isinstance(vehicle, dict) and 'x' in vehicle

    if is_visual_turtle:
        # Get sensor readings for visual turtle
        try:
            left_activation, right_activation = get_sensor_readings(vehicle, vehicle_data)
        except Exception as e:
            print(f"Error getting sensor readings for {vehicle_id}: {e}")
            return
    elif is_placeholder_dict:
        # Simple computational simulation for placeholder data
        left_activation = random.uniform(0, 1)
        right_activation = random.uniform(0, 1)
    else:
        print(f"Unknown vehicle type for {vehicle_id}: {type(vehicle)}")
        return

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
    if is_visual_turtle:
        # Visual turtle movement
        if avg_speed > 0.1:  # Only move if there's significant speed
            try:
                vehicle.right(turn_amount)
                vehicle.forward(avg_speed)
            except Exception as e:
                print(f"Error moving visual turtle {vehicle_id}: {e}")
                return

        # Keep within canvas bounds
        try:
            pos = vehicle.pos()
            if abs(pos[0]) > 280 or abs(pos[1]) > 180:
                # Turn around if hitting boundary
                vehicle.right(random.randint(120, 240))
        except Exception as e:
            print(f"Error checking bounds for turtle {vehicle_id}: {e}")
    elif is_placeholder_dict:
        # Computational movement for placeholder data
        if avg_speed > 0.1:
            # Update placeholder position data
            radians = math.radians(vehicle['heading'])
            vehicle['x'] += avg_speed * math.cos(radians)
            vehicle['y'] += avg_speed * math.sin(radians)
            vehicle['heading'] = (vehicle['heading'] + turn_amount) % 360

            # Keep within bounds
            vehicle['x'] = max(-280, min(280, vehicle['x']))
            vehicle['y'] = max(-180, min(180, vehicle['y']))

def move_all_vehicles():
    """Move all vehicles one step"""
    simulation_state['step_count'] += 1

    for vehicle_id in simulation_state['vehicles']:
        try:
            move_vehicle(vehicle_id)
        except Exception as e:
            print(f"Error moving vehicle {vehicle_id}: {e}")
            # Skip this vehicle and continue with others
            continue

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

    print("🎬 Starting simulation...")

    # Check if graphics are available
    graphics_ready = check_graphics_ready()
    if graphics_ready:
        print("✅ Full visual simulation with interactive graphics!")
        print("🎮 Try dragging the orange heat sources while vehicles are moving!")

        try:
            # Import pyodide for creating stable proxies
            import js
            from pyodide.ffi import create_proxy

            # Create animation callback function
            def animation_callback():
                if simulation_state['running'] and simulation_state['animation_active']:
                    move_all_vehicles()

            # Create a stable proxy for the callback to prevent auto-destruction
            callback_proxy = create_proxy(animation_callback)

            # Store the callback to prevent garbage collection
            simulation_state['animation_callback'] = callback_proxy

            # Register the animation callback with the graphics system
            turtle_graphics.set_animation_callback(callback_proxy)

            # Start the animation loop
            turtle_graphics.start_animation()
        except Exception as e:
            print(f"⚠️ Graphics animation failed: {e}")
            print("🔄 Falling back to computational simulation...")
            graphics_ready = False

    if not graphics_ready:
        print("📊 Running computational simulation (no graphics)")
        print("💡 Refresh the page to try loading graphics again")

        # Run a simple computational simulation
        print("\\n🔢 Running 10 simulation steps...")
        for step in range(10):
            if not simulation_state['running']:
                break
            move_all_vehicles()
            if step % 3 == 0:
                print(f"Step {step + 1}: Vehicles moved")

        print("✅ Computational simulation complete!")

    print("⏹️ Use stop_simulation() to stop")

def stop_simulation():
    """Stop the simulation"""
    simulation_state['running'] = False
    simulation_state['animation_active'] = False

    try:
        turtle_graphics.stop_animation()
    except Exception as e:
        print(f"⚠️ Error stopping animation: {e}")

    # Clean up callback proxy
    if simulation_state['animation_callback']:
        try:
            simulation_state['animation_callback'].destroy()
        except:
            pass
        simulation_state['animation_callback'] = None

    print("⏹️ Simulation stopped!")

def reset_simulation():
    """Reset the simulation with new random positions"""
    stop_simulation()
    print("🔄 Resetting simulation...")
    create_simulation()

def reload_simulation():
    """Reload the simulation with graphics if now available"""
    was_running = simulation_state['running']
    if was_running:
        stop_simulation()

    print("🔄 Reloading simulation with current graphics state...")

    # Check if graphics are now available
    if check_graphics_ready():
        print("✅ Graphics are now available! Creating visual elements...")

        # Convert existing placeholder data to visual elements
        for heat_id, heat_data in list(simulation_state['heat_sources'].items()):
            if isinstance(heat_data, dict) and 'x' in heat_data:
                try:
                    # Create visual heat source from placeholder data
                    x, y = heat_data['x'], heat_data['y']
                    heat_source = turtle_graphics.create_heat_source(heat_id, x, y)
                    simulation_state['heat_sources'][heat_id] = heat_source
                    print(f"🔥 Converted heat source {heat_id} to visual at ({x}, {y})")
                except Exception as e:
                    print(f"⚠️ Could not convert heat source {heat_id}: {e}")

        for vehicle_id, vehicle_data in list(simulation_state['vehicles'].items()):
            if isinstance(vehicle_data, dict) and 'x' in vehicle_data:
                try:
                    # Create visual vehicle from placeholder data
                    x, y = vehicle_data['x'], vehicle_data['y']
                    heading = vehicle_data['heading']
                    vehicle_type = vehicle_data['type']

                    vehicle = turtle_graphics.create_vehicle(vehicle_id, vehicle_type)
                    vehicle.goto(x, y)
                    vehicle.setheading(heading)
                    simulation_state['vehicles'][vehicle_id] = vehicle

                    color = "red" if vehicle_type == "crossed" else "blue"
                    print(f"🚗 Converted {color} vehicle {vehicle_id} to visual at ({x}, {y})")
                except Exception as e:
                    print(f"⚠️ Could not convert vehicle {vehicle_id}: {e}")

        print("✅ Visual simulation ready! Try start_visual_simulation() now.")
    else:
        print("⚠️ Graphics still not available.")

    if was_running:
        print("🔄 Restarting simulation...")
        start_visual_simulation()

def clear_simulation():
    """Clear all graphics and reset"""
    stop_simulation()
    turtle_graphics.clear_all()
    simulation_state['vehicles'] = {}
    simulation_state['heat_sources'] = {}
    simulation_state['vehicle_data'] = {}
    simulation_state['step_count'] = 0
    print("🧹 Simulation cleared!")

def status():
    """Show simulation status"""
    print("\\n📊 Simulation Status:")
    print("===================")
    print(f"Graphics ready: {'✅ Yes' if check_graphics_ready() else '❌ No'}")
    print(f"Vehicles: {len(simulation_state['vehicles'])}")
    print(f"Heat sources: {len(simulation_state['heat_sources'])}")
    print(f"Running: {'✅ Yes' if simulation_state['running'] else '❌ No'}")
    print(f"Step count: {simulation_state['step_count']}")

    # Debug vehicle types
    print("\\n🔍 Vehicle Types:")
    for vehicle_id, vehicle in simulation_state['vehicles'].items():
        is_visual = hasattr(vehicle, 'pos') and callable(vehicle.pos)
        is_dict = isinstance(vehicle, dict)
        print(f"  {vehicle_id}: {'Visual Turtle' if is_visual else 'Dict Data' if is_dict else 'Unknown'} ({type(vehicle).__name__})")

def print_help():
    """Show available commands"""
    print("\\n🎮 Braitenberg Vehicle Simulation Commands:")
    print("================================")
    print("🎬 start_visual_simulation() - Start animated simulation")
    print("⏹️ stop_simulation() - Stop animation")
    print("📈 step_simulation() - Move one step manually")
    print("🔄 reset_simulation() - Reset with new positions")
    print("🔄 reload_simulation() - Convert to visual if graphics ready")
    print("🧹 clear_simulation() - Clear all graphics")
    print("📊 status() - Show simulation status")
    print("❓ print_help() - Show this help")
    print("\\n🎯 Interactive Features:")
    print("• Drag orange heat sources with your mouse (if graphics available)")
    print("• Watch vehicles respond in real-time")
    print("• Red vehicles are attracted, blue vehicles avoid")
    print("\\n💡 Tip: If you see empty canvas, try reload_simulation()")

# Initialize the simulation
create_simulation()

print("\\n🎉 Interactive Braitenberg Vehicle Simulation Ready!")
print("\\n🚀 Quick Start: start_visual_simulation()")
print("❓ Need help? Run: print_help()")

# Auto-setup: Try to initialize graphics and start simulation
print("\\n🔄 Auto-initializing graphics...")
status()

if check_graphics_ready():
    print("✅ Graphics ready - starting visual simulation!")
    start_visual_simulation()
else:
    print("⚠️ Graphics not ready yet. Trying to reload...")
    # Wait a moment and try again
    import time
    try:
        # Short delay to let graphics initialize
        reload_simulation()
        if check_graphics_ready():
            print("✅ Graphics now ready - starting visual simulation!")
            start_visual_simulation()
        else:
            print("📊 Running computational simulation instead")
            print("💡 Try reload_simulation() manually if graphics become available")
    except Exception as e:
        print(f"⚠️ Auto-setup failed: {e}")
        print("💡 Try running the commands manually:")`;

export function BraitenbergDemo() {
  const playgroundRef = React.useRef<any>(null);

  // Function to execute Python commands
  const runPythonCommand = (command: string) => {
    if (playgroundRef.current?.runCode) {
      playgroundRef.current.runCode(command);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">Braitenberg Vehicles - Interactive Demo</h2>
        <p className="text-gray-600 mb-4">
          This interactive demonstration shows Braitenberg Vehicles, simple autonomous agents that exhibit
          complex behaviors through basic sensor-motor connections. The simulation has been adapted to run
          entirely in your browser using our Python playground.
        </p>

        {/* Quick Action Buttons */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">🎮 Quick Controls</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => runPythonCommand('status()')}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              📊 Status
            </button>
            <button
              onClick={() => runPythonCommand('reload_simulation()')}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              🔄 Reload
            </button>
            <button
              onClick={() => runPythonCommand('start_visual_simulation()')}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
            >
              🎬 Start
            </button>
            <button
              onClick={() => runPythonCommand('stop_simulation()')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              ⏹️ Stop
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <button
              onClick={() => runPythonCommand('step_simulation()')}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              📈 Step
            </button>
            <button
              onClick={() => runPythonCommand('reset_simulation()')}
              className="px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
            >
              🔄 Reset
            </button>
            <button
              onClick={() => runPythonCommand('print_help()')}
              className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
            >
              ❓ Help
            </button>
          </div>
          <p className="text-blue-600 text-xs mt-2">
            💡 Click these buttons to run commands instantly, or type them in the Python code editor below.
          </p>
        </div>

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
        ref={playgroundRef}
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