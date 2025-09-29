// Advanced Turtle Graphics Manager for Multi-Turtle Simulations
// Handles multiple turtles, animations, and interactive elements

import { WebTurtle } from './web-turtle';

export interface TurtleEntity {
  id: string;
  turtle: WebTurtle;
  type: 'vehicle' | 'heat_source';
  data: any; // Vehicle or heat source specific data
}

export interface AnimationFrame {
  entities: TurtleEntity[];
  timestamp: number;
}

export class TurtleManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entities: Map<string, TurtleEntity> = new Map();
  private animationId: number | null = null;
  private isAnimating = false;
  private canvasSize: { width: number; height: number };
  private animationCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;
    this.canvasSize = { width: canvas.width, height: canvas.height };
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Clear canvas with white background
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Set up coordinate system with (0,0) at center
    this.ctx.save();
  }

  // Create a new turtle entity
  createTurtle(id: string, type: 'vehicle' | 'heat_source', initialData?: any): WebTurtle {
    // Remove existing turtle with same ID
    if (this.entities.has(id)) {
      this.removeTurtle(id);
    }

    // Create new WebTurtle instance sharing the same canvas
    const turtle = new WebTurtle(this.canvas);

    const entity: TurtleEntity = {
      id,
      turtle,
      type,
      data: initialData || {}
    };

    this.entities.set(id, entity);
    return turtle;
  }

  // Remove a turtle entity
  removeTurtle(id: string): void {
    this.entities.delete(id);
  }

  // Get a turtle by ID
  getTurtle(id: string): WebTurtle | null {
    const entity = this.entities.get(id);
    return entity ? entity.turtle : null;
  }

  // Get all turtles of a specific type
  getTurtlesByType(type: 'vehicle' | 'heat_source'): TurtleEntity[] {
    return Array.from(this.entities.values()).filter(entity => entity.type === type);
  }

  // Update entity data
  updateEntityData(id: string, data: any): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.data = { ...entity.data, ...data };
    }
  }

  // Clear all turtles
  clearAll(): void {
    this.entities.clear();
    this.setupCanvas();
  }

  // Set animation callback (called by Python)
  setAnimationCallback(callback: () => void): void {
    this.animationCallback = callback;
  }

  // Start animation loop
  startAnimation(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    const animate = () => {
      if (!this.isAnimating) return;

      // Call Python animation callback if available
      if (this.animationCallback) {
        try {
          this.animationCallback();
        } catch (error) {
          console.error('Animation callback error:', error);
        }
      }

      this.render();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Stop animation loop
  stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Render all entities
  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Render all entities in order: heat sources first, then vehicles
    const heatSources = this.getTurtlesByType('heat_source');
    const vehicles = this.getTurtlesByType('vehicle');

    // Render heat sources first (so they appear behind vehicles)
    heatSources.forEach(entity => this.renderEntity(entity));

    // Render vehicles on top
    vehicles.forEach(entity => this.renderEntity(entity));
  }

  private renderEntity(entity: TurtleEntity): void {
    const { turtle, type, data } = entity;
    const pos = turtle.pos();

    this.ctx.save();

    // Transform to turtle position
    const canvasX = this.canvasSize.width / 2 + pos.x;
    const canvasY = this.canvasSize.height / 2 - pos.y; // Flip Y axis

    this.ctx.translate(canvasX, canvasY);

    if (type === 'heat_source') {
      this.renderHeatSource(data);
    } else if (type === 'vehicle') {
      this.renderVehicle(turtle, data);
    }

    this.ctx.restore();
  }

  private renderHeatSource(data: any): void {
    // Draw orange circle for heat source
    this.ctx.fillStyle = '#FF8C00';
    this.ctx.strokeStyle = '#FF6600';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    // Add glow effect
    this.ctx.shadowColor = '#FF8C00';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  private renderVehicle(turtle: WebTurtle, data: any): void {
    const heading = turtle.heading();
    const vehicleType = data.type || 'direct';

    // Rotate to vehicle heading
    this.ctx.rotate((90 - heading) * Math.PI / 180);

    // Set colors based on vehicle type
    if (vehicleType === 'crossed') {
      this.ctx.fillStyle = '#FF4444';
      this.ctx.strokeStyle = '#CC0000';
    } else {
      this.ctx.fillStyle = '#4444FF';
      this.ctx.strokeStyle = '#0000CC';
    }

    this.ctx.lineWidth = 2;

    // Draw vehicle as an arrow/triangle
    this.ctx.beginPath();
    this.ctx.moveTo(0, -12);      // Point (front)
    this.ctx.lineTo(-8, 8);       // Left back
    this.ctx.lineTo(0, 4);        // Center back
    this.ctx.lineTo(8, 8);        // Right back
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Add sensors (small circles on sides)
    this.ctx.fillStyle = vehicleType === 'crossed' ? '#FFB3B3' : '#B3B3FF';

    // Left sensor
    this.ctx.beginPath();
    this.ctx.arc(-6, -4, 2, 0, 2 * Math.PI);
    this.ctx.fill();

    // Right sensor
    this.ctx.beginPath();
    this.ctx.arc(6, -4, 2, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  // Handle mouse/touch events for dragging heat sources
  setupInteractivity(): void {
    let dragging: TurtleEntity | null = null;
    let dragOffset = { x: 0, y: 0 };

    const getMousePos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const canvasToTurtle = (canvasX: number, canvasY: number): { x: number; y: number } => {
      return {
        x: canvasX - this.canvasSize.width / 2,
        y: this.canvasSize.height / 2 - canvasY, // Flip Y axis
      };
    };

    const startDrag = (pos: { x: number; y: number }) => {
      const turtlePos = canvasToTurtle(pos.x, pos.y);

      // Check if click is on a heat source
      const heatSources = this.getTurtlesByType('heat_source');
      for (const entity of heatSources) {
        const entityPos = entity.turtle.pos();
        const distance = Math.sqrt(
          Math.pow(turtlePos.x - entityPos.x, 2) +
          Math.pow(turtlePos.y - entityPos.y, 2)
        );

        if (distance <= 20) { // 20px drag tolerance
          dragging = entity;
          dragOffset = {
            x: turtlePos.x - entityPos.x,
            y: turtlePos.y - entityPos.y
          };
          this.canvas.style.cursor = 'grabbing';
          break;
        }
      }
    };

    const doDrag = (pos: { x: number; y: number }) => {
      if (!dragging) return;

      const turtlePos = canvasToTurtle(pos.x, pos.y);
      const newX = turtlePos.x - dragOffset.x;
      const newY = turtlePos.y - dragOffset.y;

      // Update turtle position
      dragging.turtle.goto(newX, newY);

      // Update entity data
      this.updateEntityData(dragging.id, { x: newX, y: newY });

      // Trigger callback if available
      if (dragging.data.onDrag) {
        dragging.data.onDrag(newX, newY);
      }
    };

    const endDrag = () => {
      dragging = null;
      this.canvas.style.cursor = 'default';
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => startDrag(getMousePos(e)));
    this.canvas.addEventListener('mousemove', (e) => doDrag(getMousePos(e)));
    this.canvas.addEventListener('mouseup', endDrag);
    this.canvas.addEventListener('mouseleave', endDrag);

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) startDrag(getMousePos(e.touches[0]));
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) doDrag(getMousePos(e.touches[0]));
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      endDrag();
    });
  }

  // Get canvas for external access
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // Resize canvas
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasSize = { width, height };
    this.setupCanvas();
  }
}