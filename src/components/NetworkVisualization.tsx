"use client";

import { useEffect, useRef, useState, useMemo } from "react"
import { Brain, Zap, Eye, Cpu } from "lucide-react"

interface Node {
  id: string
  x: number
  y: number
  label: string
  type: "concept" | "theory" | "research" | "application"
  icon: any
  connections: string[]
}

export function NetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  
  const nodes: Node[] = [
    { id: "1", x: 200, y: 150, label: "Neural Networks", type: "concept", icon: Brain, connections: ["2", "3"] },
    { id: "2", x: 400, y: 100, label: "Synaptic Plasticity", type: "theory", icon: Zap, connections: ["1", "4"] },
    { id: "3", x: 300, y: 250, label: "Visual Perception", type: "research", icon: Eye, connections: ["1", "4"] },
    { id: "4", x: 500, y: 200, label: "AI Applications", type: "application", icon: Cpu, connections: ["2", "3"] },
  ]

  const typeColors = {
    concept: "hsl(var(--neural-primary))",
    theory: "hsl(var(--synapse-primary))",
    research: "hsl(var(--cognition-teal))",
    application: "hsl(var(--cognition-orange))"
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      ctx.strokeStyle = "hsl(var(--neural-light) / 0.3)"
      ctx.lineWidth = 2
      
      nodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const connectedNode = nodes.find(n => n.id === connectionId)
          if (connectedNode) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(connectedNode.x, connectedNode.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id
        const radius = isHovered ? 35 : 30
        
        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = typeColors[node.type]
        ctx.fill()
        
        // Node border
        ctx.strokeStyle = isHovered ? "hsl(var(--synapse-primary))" : "hsl(var(--border))"
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.stroke()
        
        // Inner glow for hovered
        if (isHovered) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI)
          ctx.strokeStyle = `${typeColors[node.type]}40`
          ctx.lineWidth = 8
          ctx.stroke()
        }
      })
    }

    draw()
  }, [hoveredNode, nodes, typeColors])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hoveredNodeId = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= 35
    })?.id || null

    setHoveredNode(hoveredNodeId)
  }

  return (
    <section className="py-24 bg-neural-subtle/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neural-primary mb-4">
            Interactive Knowledge Network
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore how concepts in brain and cognitive sciences connect and influence each other
            through our interactive neural network visualization.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="cognitive-card p-8">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full h-auto cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredNode(null)}
            />
            
            {/* Node Labels */}
            <div className="relative">
              {nodes.map(node => {
                const Icon = node.icon
                return (
                  <div
                    key={node.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                      hoveredNode === node.id ? 'scale-110 z-10' : ''
                    }`}
                    style={{
                      left: `${(node.x / 600) * 100}%`,
                      top: `${(node.y / 300) * 100}%`,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <Icon className="h-5 w-5 text-primary-foreground mb-1" />
                      <div className={`text-xs font-medium text-center transition-colors ${
                        hoveredNode === node.id ? 'text-synapse-primary' : 'text-muted-foreground'
                      }`}>
                        {node.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}