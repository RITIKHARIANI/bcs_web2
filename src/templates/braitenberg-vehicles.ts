// Braitenberg Vehicles Playground Template
// Interactive simulation of autonomous agents with sensor-motor connections

import {
  PlaygroundTemplate,
  PlaygroundCategory,
  ControlType,
  VisualizationType,
  ControlConfig,
  VisualizationConfig,
} from '@/types/playground';

// Default controls for Braitenberg Vehicles
const defaultControls: ControlConfig[] = [
  {
    id: 'num_vehicles',
    type: ControlType.SLIDER,
    label: 'Number of Vehicles',
    description: 'How many vehicles to simulate',
    bindTo: 'num_vehicles',
    config: {
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 4,
    },
    position: { x: 20, y: 20 },
    width: 200,
  },
  {
    id: 'num_heat_sources',
    type: ControlType.SLIDER,
    label: 'Heat Sources',
    description: 'Number of heat sources (attractors)',
    bindTo: 'num_heat_sources',
    config: {
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 3,
    },
    position: { x: 20, y: 80 },
    width: 200,
  },
  {
    id: 'vehicle_speed',
    type: ControlType.SLIDER,
    label: 'Base Speed',
    description: 'Base movement speed of vehicles',
    bindTo: 'base_speed',
    config: {
      min: 1,
      max: 30,
      step: 1,
      defaultValue: 15,
    },
    position: { x: 20, y: 140 },
    width: 200,
  },
  {
    id: 'start_btn',
    type: ControlType.BUTTON,
    label: 'Start Simulation',
    description: 'Start the simulation',
    bindTo: 'start_simulation',
    config: {
      action: 'custom',
      customAction: 'start_visual_simulation',
    },
    position: { x: 20, y: 200 },
    width: 100,
  },
  {
    id: 'stop_btn',
    type: ControlType.BUTTON,
    label: 'Stop',
    description: 'Stop the simulation',
    bindTo: 'stop_simulation',
    config: {
      action: 'custom',
      customAction: 'stop_simulation',
    },
    position: { x: 130, y: 200 },
    width: 90,
  },
  {
    id: 'reset_btn',
    type: ControlType.BUTTON,
    label: 'Reset',
    description: 'Reset simulation',
    bindTo: 'reset_simulation',
    config: {
      action: 'custom',
      customAction: 'reset_simulation',
    },
    position: { x: 230, y: 200 },
    width: 90,
  },
];

// Default visualization configuration
const defaultVisualization: VisualizationConfig = {
  type: VisualizationType.CANVAS,
  config: {
    width: 600,
    height: 400,
    backgroundColor: '#ffffff',
    useWebTurtle: false,
    useTurtleManager: true,
  },
  layout: {
    width: 600,
    height: 400,
    position: { x: 350, y: 20 },
  },
};

// Python code template for Braitenberg Vehicles
const codeTemplate = `# Braitenberg Vehicles - Interactive Simulation
# Autonomous agents with sensor-motor connections

import random
import math
import turtle_graphics
from pyodide.ffi import create_proxy

# Global simulation state
state = {
    'running': False,
    'vehicles': {},
    'heat_sources': {},
    'vehicle_data': {},
    'animation_callback': None,
    'step_count': 0
}

# Parameters (bound to UI controls)
params = {
    'num_vehicles': 4,
    'num_heat_sources': 3,
    'base_speed': 15
}

def create_simulation():
    """Initialize vehicles and heat sources"""
    print(f"Creating {params['num_vehicles']} vehicles and {params['num_heat_sources']} heat sources...")

    # Clear existing
    turtle_graphics.clear_all()
    state['vehicles'] = {}
    state['heat_sources'] = {}
    state['vehicle_data'] = {}

    # Create heat sources
    for i in range(params['num_heat_sources']):
        heat_id = f"heat_{i}"
        x = random.randint(-200, 200)
        y = random.randint(-150, 150)
        heat_source = turtle_graphics.create_heat_source(heat_id, x, y)
        state['heat_sources'][heat_id] = heat_source

    # Create vehicles
    vehicle_types = ["crossed", "direct"]
    for i in range(params['num_vehicles']):
        vehicle_id = f"vehicle_{i}"
        vehicle_type = vehicle_types[i % 2]
        x = random.randint(-150, 150)
        y = random.randint(-100, 100)

        vehicle = turtle_graphics.create_vehicle(vehicle_id, vehicle_type)
        vehicle.goto(x, y)
        vehicle.setheading(random.randint(0, 360))

        state['vehicles'][vehicle_id] = vehicle
        state['vehicle_data'][vehicle_id] = {
            'type': vehicle_type,
            'base_speed': params['base_speed']
        }

    print("Simulation created!")

def distance(x1, y1, x2, y2):
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def move_vehicle(vehicle_id):
    """Move vehicle based on Braitenberg logic"""
    vehicle = state['vehicles'][vehicle_id]
    data = state['vehicle_data'][vehicle_id]

    # Simplified Braitenberg logic
    left_activation = 0
    right_activation = 0

    for heat_source in state['heat_sources'].values():
        heat_pos = heat_source.pos()
        vehicle_pos = vehicle.pos()

        dist = distance(vehicle_pos[0], vehicle_pos[1], heat_pos[0], heat_pos[1])
        if dist < 200:
            activation = (200 - dist) / 200

            if data['type'] == 'crossed':
                left_activation += activation
                right_activation += activation * 0.5
            else:
                right_activation += activation
                left_activation += activation * 0.5

    # Calculate movement
    avg_speed = (left_activation + right_activation) * data['base_speed'] / 2
    turn = (right_activation - left_activation) * 10

    if avg_speed > 0.1:
        vehicle.right(turn)
        vehicle.forward(min(avg_speed, 5))

def move_all_vehicles():
    """Move all vehicles"""
    for vehicle_id in state['vehicles']:
        move_vehicle(vehicle_id)
    state['step_count'] += 1

def start_visual_simulation():
    """Start animated simulation"""
    state['running'] = True

    def animation_callback():
        if state['running']:
            move_all_vehicles()

    state['animation_callback'] = create_proxy(animation_callback)
    turtle_graphics.set_animation_callback(state['animation_callback'])
    turtle_graphics.start_animation()

    print("Simulation started!")

def stop_simulation():
    """Stop simulation"""
    state['running'] = False
    turtle_graphics.stop_animation()
    print("Simulation stopped!")

def reset_simulation():
    """Reset simulation"""
    stop_simulation()
    create_simulation()

# Initialize
create_simulation()
print("Ready! Use the controls to start the simulation.")
`;

export const braitenbergVehiclesTemplate: PlaygroundTemplate = {
  id: 'braitenberg-vehicles',
  name: 'Braitenberg Vehicles',
  description:
    'Interactive simulation of autonomous agents with sensor-motor connections. Red vehicles are attracted to heat sources (crossed connections), while blue vehicles avoid them (direct connections).',
  category: PlaygroundCategory.ALGORITHMS,
  thumbnail: '/templates/braitenberg-vehicles.png',
  defaultControls,
  defaultVisualization,
  codeTemplate,
  pythonLibraries: ['random', 'math', 'pyodide.ffi'],
  jsLibraries: [],
  author: 'BCS Team',
  version: '1.0.0',
  tags: ['robotics', 'autonomous-agents', 'braitenberg', 'simulation', 'ai'],
};
