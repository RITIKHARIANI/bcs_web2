import { BraitenbergDemo } from '@/components/python/braitenberg-demo';
import { PythonPlayground } from '@/components/python/python-playground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Zap, BookOpen, Cpu, Palette, MousePointer } from 'lucide-react';

export default function PythonPlaygroundPage() {
  const basicExampleCode = `# Basic Python Examples

# 1. Mathematical calculations
import math
print("=== Mathematical Calculations ===")
x = 5
y = 10
print(f"x = {x}, y = {y}")
print(f"x + y = {x + y}")
print(f"x * y = {x * y}")
print(f"sqrt(x) = {math.sqrt(x):.2f}")

# 2. Working with lists
print("\\n=== Working with Lists ===")
numbers = [1, 2, 3, 4, 5]
print(f"Numbers: {numbers}")
print(f"Sum: {sum(numbers)}")
print(f"Squared: {[n**2 for n in numbers]}")

# 3. String manipulation
print("\\n=== String Manipulation ===")
text = "Python Playground"
print(f"Original: {text}")
print(f"Uppercase: {text.upper()}")
print(f"Reversed: {text[::-1]}")
print(f"Words: {text.split()}")`;

  const graphicsExampleCode = `# Graphics and Visual Examples

# Note: Full turtle graphics are still being integrated
# For now, let's create some visual patterns with text and math

import random
import math

print("Creating Visual Patterns with Math!")
print("=====================================")

# 1. ASCII Art Spiral Pattern
print("\\n1. ASCII Spiral Pattern:")
size = 10
for i in range(size):
    spaces = " " * i
    stars = "*" * (size - i)
    print(f"{spaces}{stars}")

print("\\n" + " " * (size-1) + "*")  # Center point

# 2. Mathematical Wave Pattern
print("\\n2. Mathematical Wave:")
width = 50
for y in range(15):
    line = ""
    for x in range(width):
        # Create a sine wave pattern
        value = math.sin(x * 0.3) * 5 + 7
        if abs(y - value) < 1:
            line += "*"
        else:
            line += " "
    print(line)

# 3. Random Pattern Generation
print("\\n3. Random Pattern:")
patterns = ['●', '○', '■', '□', '♦', '♢']
for row in range(8):
    line = ""
    for col in range(20):
        if random.random() > 0.7:
            line += random.choice(patterns)
        else:
            line += " "
    print(line)

# 4. Geometric Calculations
print("\\n4. Geometric Calculations:")
print("Circle areas for different radii:")
for r in range(1, 6):
    area = math.pi * r * r
    print(f"Radius {r}: Area = {area:.2f}")

print("\\n5. Coordinate System Demo:")
print("Plotting points in a coordinate system:")
points = [(0, 0), (3, 4), (-2, 1), (5, -3), (-4, -2)]
for i, (x, y) in enumerate(points):
    distance = math.sqrt(x*x + y*y)
    print(f"Point {i+1}: ({x}, {y}) - Distance from origin: {distance:.2f}")

print("\\nTry modifying the patterns above!")
print("You can change the math functions, ranges, or characters used.")`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-light via-background to-cognition-teal/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-neural-primary to-cognition-teal bg-clip-text text-transparent">
            Python Playground
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Execute Python code directly in your browser with interactive graphics support.
            Perfect for learning, prototyping, and creating educational demonstrations.
          </p>

          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              Pyodide Powered
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Interactive Graphics
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              No Server Required
            </Badge>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-neural-primary" />
                Full Python Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete Python 3.11 environment with NumPy, Matplotlib, and scientific libraries.
                Execute complex algorithms and data analysis directly in your browser.
              </p>
            </CardContent>
          </Card>

          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-cognition-teal" />
                Interactive Graphics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Turtle graphics with drag-and-drop support. Create animations, simulations, and
                interactive demonstrations that respond to user input in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Educational Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Convert existing tkinter/turtle educational code for web deployment.
                Perfect for cognitive science demonstrations and interactive learning.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Examples */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Python</TabsTrigger>
            <TabsTrigger value="graphics">Graphics & Turtle</TabsTrigger>
            <TabsTrigger value="braitenberg">Braitenberg Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="prose max-w-none mb-6">
              <h2 className="text-2xl font-bold">Basic Python Programming</h2>
              <p className="text-muted-foreground">
                Start with fundamental Python concepts. This playground supports all standard Python
                features including mathematics, string manipulation, list comprehensions, and more.
              </p>
            </div>

            <PythonPlayground
              initialCode={basicExampleCode}
              title="Basic Python Examples"
              description="Learn Python fundamentals with interactive examples"
              height={400}
              showCanvas={false}
            />
          </TabsContent>

          <TabsContent value="graphics" className="space-y-6">
            <div className="prose max-w-none mb-6">
              <h2 className="text-2xl font-bold">Interactive Graphics & Turtle</h2>
              <p className="text-muted-foreground">
                Create visual programs using our web-compatible turtle graphics system. Draw patterns,
                create animations, and build interactive visual demonstrations.
              </p>
            </div>

            <PythonPlayground
              initialCode={graphicsExampleCode}
              title="Visual Patterns Examples"
              description="Create visual patterns and mathematical graphics with Python"
              height={500}
              showCanvas={false}
            />
          </TabsContent>

          <TabsContent value="braitenberg" className="space-y-6">
            <BraitenbergDemo />
          </TabsContent>
        </Tabs>

        {/* Documentation Section */}
        <div className="mt-12 space-y-6">
          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle>Converting Desktop Python Code for Web</CardTitle>
              <CardDescription>
                Guidelines for adapting existing Python educational demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-red-600">Desktop Code (Original)</h3>
                  <pre className="text-xs bg-red-50 p-3 rounded border-l-4 border-red-200 overflow-x-auto">
{`import tkinter as tk
from turtle import RawTurtle, TurtleScreen

# Create window and canvas
root = tk.Tk()
canvas = tk.Canvas(root, width=500, height=500)
canvas.pack()
screen = TurtleScreen(canvas)

# Create turtle
turtle = RawTurtle(screen)
turtle.forward(100)

# GUI buttons
button = tk.Button(root, text="Start",
                   command=start_function)
button.pack()

root.mainloop()`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-green-600">Web Code (Converted)</h3>
                  <pre className="text-xs bg-green-50 p-3 rounded border-l-4 border-green-200 overflow-x-auto">
{`import web_turtle
import js

# Get web turtle instance
turtle = web_turtle.create_turtle()
turtle.forward(100)

# Function-based controls
def start_function():
    print("Starting simulation...")
    # Your code here

def stop_function():
    print("Stopping simulation...")

# Call functions directly
start_function()

print("Use start_function() and stop_function()")
print("to control the simulation!")`}
                  </pre>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Key Changes Summary:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>✅ <code>import tkinter</code> → <code>import web_turtle, js</code></li>
                  <li>✅ <code>RawTurtle(canvas)</code> → <code>web_turtle.create_turtle()</code></li>
                  <li>✅ <code>root.mainloop()</code> → Function-based execution</li>
                  <li>✅ <code>tk.Button(...)</code> → Direct function calls</li>
                  <li>✅ Same turtle API: <code>forward()</code>, <code>right()</code>, <code>goto()</code>, etc.</li>
                  <li>✅ Same drag functionality: <code>turtle.ondrag(handler)</code></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle>Available Libraries & Features</CardTitle>
              <CardDescription>
                Scientific computing and visualization libraries included
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Core Libraries</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">math</Badge>
                      Mathematical functions and constants
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">random</Badge>
                      Random number generation and selection
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">numpy</Badge>
                      Numerical computing and arrays
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">matplotlib</Badge>
                      Plotting and data visualization
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Interactive Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">web_turtle</Badge>
                      Browser-compatible turtle graphics
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">drag & drop</Badge>
                      Interactive object manipulation
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">real-time</Badge>
                      Live code execution and updates
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">responsive</Badge>
                      Works on desktop and mobile devices
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}