// Web Turtle Graphics Engine
// Browser-compatible turtle graphics API that mimics Python's turtle module
// Uses HTML5 Canvas for high-performance rendering

export interface TurtleState {
  x: number;
  y: number;
  heading: number; // degrees
  penDown: boolean;
  penColor: string;
  fillColor: string;
  penSize: number;
  speed: number;
  shape: string;
  visible: boolean;
  turtleSize: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Web-based turtle graphics implementation
 * Compatible with Python turtle module API
 */
export class WebTurtle {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: TurtleState;
  private path: Array<{ x: number; y: number; penDown: boolean; color: string; size: number }>;
  private canvasSize: CanvasSize;
  private centerX: number;
  private centerY: number;
  private animationId: number | null = null;
  private onDragCallback: ((x: number, y: number) => void) | null = null;
  private isDragging = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;

    // Initialize canvas size
    this.canvasSize = {
      width: canvas.width,
      height: canvas.height,
    };

    this.centerX = this.canvasSize.width / 2;
    this.centerY = this.canvasSize.height / 2;

    // Initialize turtle state
    this.state = {
      x: 0,
      y: 0,
      heading: 90, // North (up) in turtle coordinates
      penDown: true,
      penColor: 'black',
      fillColor: 'black',
      penSize: 1,
      speed: 6,
      shape: 'classic',
      visible: true,
      turtleSize: 1,
    };

    this.path = [];
    this.setupCanvas();
    this.setupEventListeners();
    this.draw();
  }

  private setupCanvas(): void {
    // Set up coordinate system with (0,0) at center, y-axis pointing up
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Setup default drawing properties
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private setupEventListeners(): void {
    // Mouse/touch event listeners for drag functionality
    const getMousePos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrag = (e: MouseEvent | Touch) => {
      const pos = getMousePos(e);
      const turtleCanvasPos = this.turtleToCanvas(this.state.x, this.state.y);

      // Check if click is near turtle
      const distance = Math.sqrt(
        Math.pow(pos.x - turtleCanvasPos.x, 2) +
        Math.pow(pos.y - turtleCanvasPos.y, 2)
      );

      if (distance <= 20) { // 20px drag tolerance
        this.isDragging = true;
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const doDrag = (e: MouseEvent | Touch) => {
      if (!this.isDragging) return;

      const pos = getMousePos(e);
      const turtlePos = this.canvasToTurtle(pos.x, pos.y);

      this.state.x = turtlePos.x;
      this.state.y = turtlePos.y;

      if (this.onDragCallback) {
        this.onDragCallback(turtlePos.x, turtlePos.y);
      }

      this.draw();
    };

    const endDrag = () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => startDrag(e));
    this.canvas.addEventListener('mousemove', (e) => doDrag(e));
    this.canvas.addEventListener('mouseup', endDrag);
    this.canvas.addEventListener('mouseleave', endDrag);

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) startDrag(e.touches[0]);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) doDrag(e.touches[0]);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      endDrag();
    });
  }

  // Coordinate conversion methods
  private turtleToCanvas(x: number, y: number): { x: number; y: number } {
    return {
      x: this.centerX + x,
      y: this.centerY - y, // Flip Y axis (turtle Y points up, canvas Y points down)
    };
  }

  private canvasToTurtle(x: number, y: number): { x: number; y: number } {
    return {
      x: x - this.centerX,
      y: this.centerY - y, // Flip Y axis
    };
  }

  // Drawing methods
  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Draw path
    if (this.path.length > 0) {
      this.ctx.save();

      let currentPos = this.path[0];
      let currentColor = currentPos.color;
      let currentSize = currentPos.size;

      this.ctx.beginPath();
      this.ctx.strokeStyle = currentColor;
      this.ctx.lineWidth = currentSize;

      const startCanvas = this.turtleToCanvas(currentPos.x, currentPos.y);
      this.ctx.moveTo(startCanvas.x, startCanvas.y);

      for (let i = 1; i < this.path.length; i++) {
        const point = this.path[i];
        const canvasPos = this.turtleToCanvas(point.x, point.y);

        // If color or size changed, start new path
        if (point.color !== currentColor || point.size !== currentSize) {
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.strokeStyle = point.color;
          this.ctx.lineWidth = point.size;
          this.ctx.moveTo(canvasPos.x, canvasPos.y);
          currentColor = point.color;
          currentSize = point.size;
        } else if (point.penDown) {
          this.ctx.lineTo(canvasPos.x, canvasPos.y);
        } else {
          this.ctx.moveTo(canvasPos.x, canvasPos.y);
        }
      }

      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw turtle
    if (this.state.visible) {
      this.drawTurtle();
    }
  }

  private drawTurtle(): void {
    const canvasPos = this.turtleToCanvas(this.state.x, this.state.y);

    this.ctx.save();
    this.ctx.translate(canvasPos.x, canvasPos.y);
    this.ctx.rotate((90 - this.state.heading) * Math.PI / 180); // Convert to canvas rotation

    const size = 10 * this.state.turtleSize;

    // Draw turtle shape
    if (this.state.shape === 'turtle') {
      // Draw turtle shape
      this.ctx.fillStyle = this.state.fillColor;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, size * 0.8, size * 0.6, 0, 0, 2 * Math.PI);
      this.ctx.fill();

      // Head
      this.ctx.beginPath();
      this.ctx.ellipse(0, -size * 0.4, size * 0.3, size * 0.3, 0, 0, 2 * Math.PI);
      this.ctx.fill();
    } else if (this.state.shape === 'circle') {
      // Draw circle
      this.ctx.fillStyle = this.state.fillColor;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * 0.5, 0, 2 * Math.PI);
      this.ctx.fill();
    } else {
      // Default classic arrow shape
      this.ctx.fillStyle = this.state.fillColor;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -size);
      this.ctx.lineTo(-size * 0.5, size * 0.5);
      this.ctx.lineTo(0, size * 0.2);
      this.ctx.lineTo(size * 0.5, size * 0.5);
      this.ctx.closePath();
      this.ctx.fill();

      // Outline
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Python turtle API methods

  forward(distance: number): void {
    const radians = this.state.heading * Math.PI / 180;
    const newX = this.state.x + distance * Math.cos(radians);
    const newY = this.state.y + distance * Math.sin(radians);

    // Add to path
    this.path.push({
      x: newX,
      y: newY,
      penDown: this.state.penDown,
      color: this.state.penColor,
      size: this.state.penSize,
    });

    this.state.x = newX;
    this.state.y = newY;
    this.draw();
  }

  backward(distance: number): void {
    this.forward(-distance);
  }

  right(angle: number): void {
    this.state.heading -= angle;
    this.state.heading = ((this.state.heading % 360) + 360) % 360; // Normalize to 0-360
    this.draw();
  }

  left(angle: number): void {
    this.right(-angle);
  }

  goto(x: number, y: number): void {
    this.path.push({
      x: x,
      y: y,
      penDown: this.state.penDown,
      color: this.state.penColor,
      size: this.state.penSize,
    });

    this.state.x = x;
    this.state.y = y;
    this.draw();
  }

  setheading(angle: number): void {
    this.state.heading = angle;
    this.draw();
  }

  penup(): void {
    this.state.penDown = false;
  }

  pendown(): void {
    this.state.penDown = true;
  }

  color(color: string): void;
  color(penColor: string, fillColor: string): void;
  color(penColor: string, fillColor?: string): void {
    this.state.penColor = penColor;
    if (fillColor !== undefined) {
      this.state.fillColor = fillColor;
    } else {
      this.state.fillColor = penColor;
    }
    this.draw();
  }

  shape(shapeName: string): void {
    this.state.shape = shapeName;
    this.draw();
  }

  turtlesize(size: number): void {
    this.state.turtleSize = size;
    this.draw();
  }

  showturtle(): void {
    this.state.visible = true;
    this.draw();
  }

  hideturtle(): void {
    this.state.visible = false;
    this.draw();
  }

  clear(): void {
    this.path = [];
    this.draw();
  }

  // Position and heading getters
  xcor(): number {
    return this.state.x;
  }

  ycor(): number {
    return this.state.y;
  }

  pos(): { x: number; y: number } {
    return { x: this.state.x, y: this.state.y };
  }

  heading(): number {
    return this.state.heading;
  }

  // Distance and angle calculations
  distance(other: { x: number; y: number } | WebTurtle): number {
    let targetX: number, targetY: number;

    if (other instanceof WebTurtle) {
      targetX = other.state.x;
      targetY = other.state.y;
    } else {
      targetX = other.x;
      targetY = other.y;
    }

    return Math.sqrt(Math.pow(targetX - this.state.x, 2) + Math.pow(targetY - this.state.y, 2));
  }

  towards(other: { x: number; y: number } | WebTurtle): number {
    let targetX: number, targetY: number;

    if (other instanceof WebTurtle) {
      targetX = other.state.x;
      targetY = other.state.y;
    } else {
      targetX = other.x;
      targetY = other.y;
    }

    const angle = Math.atan2(targetY - this.state.y, targetX - this.state.x) * 180 / Math.PI;
    return ((angle % 360) + 360) % 360;
  }

  // Event handling
  ondrag(callback: (x: number, y: number) => void): void {
    this.onDragCallback = callback;
  }

  // Canvas management
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasSize = { width, height };
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.setupCanvas();
    this.draw();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}