# 🧪 Playground System - Comprehensive Testing Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [What You Built](#what-you-built)
3. [Three Routes to Test](#three-routes-to-test)
4. [Detailed Testing Checklist](#detailed-testing-checklist)
5. [Known Issues](#known-issues)
6. [Success Criteria](#success-criteria)
7. [Demo Script](#demo-script)
8. [Next Steps](#next-steps)

---

## 🎯 Overview

### What Is This?
You've built **Phase 1 & 2** of an **Interactive Educational Playground Builder** - a platform that lets faculty create interactive educational simulations (like TensorFlow Playground) for ANY topic using a visual drag-and-drop interface.

### What Does It Do?
- **For Faculty**: Create interactive playgrounds without coding
- **For Students**: Learn by exploring interactive simulations in the browser
- **For Admins**: Browse and manage educational content

### Current Status
- ✅ **Phase 1 (Foundation)**: 100% Complete
- ✅ **Phase 2 (Builder UI)**: 100% Complete
- 🚧 **Phase 3 (More Templates)**: 10% Complete
- 🚧 **Phase 4 (API/Database)**: 0% Complete

---

## 📍 What You Built

### Components Built:
1. **Type System** - All TypeScript interfaces (`/src/types/playground.ts`)
2. **Database Schema** - Prisma models (`/prisma/schema.prisma`)
3. **Template System** - Reusable playground configs (`/src/templates/`)
4. **Control Components** - Slider, Button, Dropdown, Checkbox (`/src/components/playground/controls/`)
5. **Parameter Binding Engine** - Links UI ↔ code variables (`/src/lib/playground/parameter-binder.ts`)
6. **Execution Engine** - Runs Python/JavaScript code (`/src/lib/playground/execution-engine.ts`)
7. **Playground Renderer** - Student view (`/src/components/playground/PlaygroundRenderer.tsx`)
8. **Builder UI** - Drag-and-drop interface (`/src/components/playground/builder/`)
9. **Routes** - Gallery, Student View, Builder pages (`/src/app/playgrounds/`)

### What's Missing (Phase 4):
- ❌ Database migrations (schema ready but not migrated)
- ❌ API routes for CRUD operations
- ❌ Authentication integration
- ❌ Save/load from database (currently only works with templates)

---

## 🚀 Three Routes to Test

| Route | URL | Purpose | For |
|-------|-----|---------|-----|
| **Gallery** | `/playgrounds` | Browse all playgrounds | Everyone |
| **Student View** | `/playgrounds/braitenberg-vehicles` | Interactive learning experience | Students |
| **Builder** | `/playgrounds/builder` | Create new playgrounds | Faculty |

---

## ✅ Detailed Testing Checklist

## Test 1: Gallery Page

### URL
```
http://localhost:3000/playgrounds
```

### What to Test

#### Page Load
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Header displays correctly
- [ ] Layout is responsive

#### Header Section
- [ ] Title: "Interactive Playgrounds"
- [ ] Subtitle: "Explore interactive educational simulations and create your own"
- [ ] "Create Playground" button visible (top right)
- [ ] Search bar visible

#### Search Functionality
- [ ] Search bar accepts text input
- [ ] Type "braitenberg" → filters to show only Braitenberg template
- [ ] Clear search → shows all templates
- [ ] Search is case-insensitive

#### Category Filters
- [ ] Filter buttons display:
  - All
  - Algorithms
  - Neural Networks
  - Physics
  - Biology
  - Chemistry
  - Mathematics
  - Custom
- [ ] Click "Algorithms" → shows only algorithm templates
- [ ] Click "All" → shows all templates
- [ ] Active filter has blue background

#### Template Cards
- [ ] At least one template card displays (Braitenberg Vehicles)
- [ ] Each card shows:
  - Gradient thumbnail/preview
  - Category badge (top-right corner)
  - Title
  - Description (2-line limit)
  - View count (0 views)
  - Fork count (0 forks)
- [ ] Hover effect works (shadow appears)

#### Navigation
- [ ] Click template card → navigates to `/playgrounds/braitenberg-vehicles`
- [ ] Click "Create Playground" button → navigates to `/playgrounds/builder`

#### Empty State (if no templates)
- [ ] Shows "No playgrounds yet" message
- [ ] Shows "Create your first interactive playground" prompt
- [ ] Shows "Create Playground" button

---

## Test 2: Student View - Braitenberg Vehicles

### URL
```
http://localhost:3000/playgrounds/braitenberg-vehicles
```

### What This Playground Teaches
**Educational Topic**: Autonomous agent behavior (AI/Robotics concept)

**Concept**: Vehicles with sensors detect "heat sources" and move based on sensor-motor connections

**Learning Goal**: Students see how simple rules create complex emergent behavior

---

### What to Test

#### A. Page Load & Layout

##### Header Section
- [ ] "Back to Playgrounds" link visible (top-left)
- [ ] Title: "Braitenberg Vehicles"
- [ ] Category badge: "ALGORITHMS" (blue)
- [ ] Metadata row shows:
  - "System Template" (user icon)
  - "0 views" (eye icon)
  - "0 forks" (fork icon)
  - "Updated [date]" (clock icon)
- [ ] "Share" button (gray)
- [ ] "Fork" button (blue)

##### Layout
- [ ] Two-panel layout:
  - **Left**: Controls panel (~30% width)
  - **Right**: Visualization panel (~70% width)
- [ ] Responsive design (resize browser to check)

##### Console Check
- [ ] No errors in browser console
- [ ] Look for "Loading Pyodide..." message
- [ ] Look for "Pyodide loaded successfully" (may take 5-10 seconds)

---

#### B. Controls Panel (Left Side)

##### Slider 1: Number of Vehicles
- [ ] Label: "Number of Vehicles"
- [ ] Range: 1 to 10
- [ ] Default value: 4
- [ ] Current value displays
- [ ] Slider moves smoothly
- [ ] Value updates when slider moves

##### Slider 2: Heat Sources
- [ ] Label: "Heat Sources"
- [ ] Range: 1 to 5
- [ ] Default value: 3
- [ ] Current value displays
- [ ] Slider moves smoothly
- [ ] Value updates when slider moves

##### Slider 3: Base Speed
- [ ] Label: "Base Speed"
- [ ] Range: 1 to 10
- [ ] Default value: 3
- [ ] Current value displays
- [ ] Slider moves smoothly
- [ ] Value updates when slider moves

##### Slider 4: Sensor Range
- [ ] Label: "Sensor Range"
- [ ] Range: 10 to 100
- [ ] Default value: 50
- [ ] Current value displays
- [ ] Slider moves smoothly
- [ ] Value updates when slider moves

##### Button 1: Start
- [ ] Label: "Start"
- [ ] Green/success styling
- [ ] Clickable
- [ ] Click triggers simulation start

##### Button 2: Stop
- [ ] Label: "Stop"
- [ ] Red/danger styling
- [ ] ClickableCan you
- [ ] Click pauses simulation

##### Button 3: Reset
- [ ] Label: "Reset"
- [ ] Secondary styling
- [ ] Clickable
- [ ] Click resets simulation

---

#### C. Visualization Panel (Right Side)

##### Canvas Setup
- [ ] Canvas element renders
- [ ] Canvas size: 600px × 400px
- [ ] White background color
- [ ] Border visible (gray)

##### Initial State (Before Start)
- [ ] Canvas is blank/empty
- [ ] Output panel shows initial messages
- [ ] No errors displayed

##### After Clicking Start
- [ ] Output shows: "Creating X vehicles and Y heat sources..."
- [ ] Output shows: "Simulation created!"
- [ ] Output shows: "Simulation started!"
- [ ] Canvas displays:
  - Multiple small shapes (vehicles) - should match slider count
  - Red circles (heat sources) - should match slider count
- [ ] Vehicles are moving (animated)
- [ ] Vehicles move toward heat sources
- [ ] Animation is smooth (~60 FPS)

##### Real-Time Parameter Updates
**This is the KEY feature - parameter binding:**

1. **Test: Change Number of Vehicles (while running)**
   - [ ] Move slider from 4 → 8
   - [ ] Wait 500ms (debounce delay)
   - [ ] New vehicles appear on canvas
   - [ ] Total count matches slider value

2. **Test: Change Speed (while running)**
   - [ ] Move slider from 3 → 8
   - [ ] Vehicles move noticeably faster
   - [ ] Movement speed matches slider value

3. **Test: Change Sensor Range (while running)**
   - [ ] Move slider from 50 → 100
   - [ ] Vehicles detect heat sources from farther away
   - [ ] Behavior changes accordingly

4. **Test: Change Heat Sources (while running)**
   - [ ] Move slider from 3 → 5
   - [ ] New heat sources appear
   - [ ] Total count matches slider value

##### Stop Functionality
- [ ] Click "Stop" button
- [ ] Animation pauses
- [ ] Vehicles freeze in current positions
- [ ] Output shows: "Simulation stopped!"

##### Reset Functionality
- [ ] Click "Reset" button
- [ ] Canvas clears
- [ ] New random positions generated
- [ ] Vehicles and heat sources reappear in new locations

---

#### D. Output Panel

##### Console Output
- [ ] Output panel displays at bottom or side
- [ ] Shows Python print() statements:
  - "Creating X vehicles and Y heat sources..."
  - "Simulation created!"
  - "Simulation started!"
  - "Simulation stopped!"
- [ ] Text is readable (good contrast)

##### Error Handling
- [ ] If Python error occurs:
  - Error message displays in red
  - Stack trace visible
  - Error doesn't crash page

---

#### E. Performance & Edge Cases

##### Performance
- [ ] Simulation runs smoothly with 1 vehicle
- [ ] Simulation runs smoothly with 10 vehicles
- [ ] No lag when adjusting sliders
- [ ] Page doesn't freeze or crash

##### Edge Cases
- [ ] Set vehicles to minimum (1) → works
- [ ] Set vehicles to maximum (10) → works
- [ ] Set speed to minimum (1) → very slow movement
- [ ] Set speed to maximum (10) → very fast movement
- [ ] Rapidly adjust sliders → no errors

##### Browser Compatibility
- [ ] Test in Chrome (recommended)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

---

## Test 3: Playground Builder

### URL
```
http://localhost:3000/playgrounds/builder
```

### What This Is
**Visual drag-and-drop interface** for faculty to create playgrounds without coding.

Think: Figma/Canva for educational simulations.

---

### What to Test

#### A. Page Load & Layout

##### Header
- [ ] Title: "Playground Builder"
- [ ] Playground title input (editable, default: "New Playground")
- [ ] "Show/Hide Preview" button (gray)
- [ ] "Save Playground" button (blue)

##### Three-Panel Layout
When on **Layout Tab**:
- [ ] **Left Panel**: Control Palette (~20% width)
- [ ] **Center Panel**: Builder Canvas (~60% width)
- [ ] **Right Panel**: Properties Panel (~20% width)

##### Tab Navigation
- [ ] Four tabs visible:
  - Layout (with Layout icon)
  - Code (with Code icon)
  - Visualization (with Settings icon)
  - Metadata (with FileText icon)
- [ ] Active tab highlighted (blue border)
- [ ] Click each tab → switches view

---

#### B. Control Palette (Left Panel - Layout Tab)

##### Header
- [ ] Title: "Controls"
- [ ] Subtitle: "Drag controls to the builder canvas"

##### Control Cards Display
- [ ] **Slider** card:
  - Blue icon (Sliders)
  - Label: "Slider"
  - Description: "Numeric range control"
- [ ] **Button** card:
  - Green icon (Square)
  - Label: "Button"
  - Description: "Action trigger"
- [ ] **Dropdown** card:
  - Purple icon (ChevronDown)
  - Label: "Dropdown"
  - Description: "Select from options"
- [ ] **Checkbox** card:
  - Orange icon (CheckSquare)
  - Label: "Checkbox"
  - Description: "Boolean toggle"
- [ ] **Color Picker** card:
  - Pink icon (Palette)
  - Label: "Color Picker"
  - Description: "Color selection"
- [ ] **Text Input** card:
  - Indigo icon (Type)
  - Label: "Text Input"
  - Description: "Text entry field"

##### Interaction
- [ ] Hover over control card → background changes to gray-100
- [ ] Hover over control card → shadow appears
- [ ] Control card has pointer cursor (draggable)

##### Quick Tips Section
- [ ] Located at bottom of palette
- [ ] Shows helpful tips:
  - "Drag controls to the canvas"
  - "Click to configure properties"
  - "Bind controls to code parameters"
  - "Preview updates in real-time"

---

#### C. Builder Canvas (Center - Layout Tab)

##### Empty State
When no controls added:
- [ ] Grid background visible (20px squares)
- [ ] "Drop controls here" message centered
- [ ] "Drag controls from the palette to get started" subtitle

##### Drag and Drop - Basic
**Test: Drag Slider onto Canvas**
1. [ ] Click and hold Slider card in palette
2. [ ] Drag cursor over canvas area
3. [ ] Release mouse
4. [ ] Control appears on canvas at drop position
5. [ ] Control automatically selected (blue ring/highlight)
6. [ ] Properties panel updates to show slider properties

##### Control Display on Canvas
Each control shows:
- [ ] Drag handle icon (left side, gray background)
- [ ] Control label (e.g., "New slider")
- [ ] Settings icon (right side)
- [ ] Control type badge (e.g., "slider → param_123")
- [ ] White background
- [ ] Border (gray)
- [ ] Hover effect (ring appears)

##### Selection
- [ ] Click control → selects it (blue ring appears)
- [ ] Click another control → selection moves
- [ ] Click canvas background → deselects all (no ring)
- [ ] Selected control highlighted in blue

##### Moving Controls
**Test: Reposition Control**
1. [ ] Click and hold control on canvas
2. [ ] Drag to new position
3. [ ] Release mouse
4. [ ] Control stays in new position
5. [ ] Position updates smoothly

##### Multiple Controls
**Test: Add Multiple Different Controls**
1. [ ] Drag Slider → appears on canvas
2. [ ] Drag Button → appears on canvas
3. [ ] Drag Dropdown → appears on canvas
4. [ ] All three controls visible
5. [ ] Each independently selectable
6. [ ] Each independently movable
7. [ ] No overlap issues

##### Click to Add
**Alternative to dragging**:
- [ ] Click control card in palette (instead of dragging)
- [ ] Control appears at default position (100, 100)
- [ ] Auto-selected

---

#### D. Properties Panel (Right - Layout Tab)

##### Empty State
When nothing selected:
- [ ] Message: "Select a control to edit its properties"
- [ ] Panel centered vertically

##### When Control Selected
Header shows:
- [ ] Title: "Properties"
- [ ] Close button (X icon, top-right)

##### Basic Properties (All Controls)
- [ ] **Control ID** field:
  - Input type: text
  - Placeholder: "unique_id"
  - Pre-filled with auto-generated ID
  - Editable

- [ ] **Label** field:
  - Input type: text
  - Placeholder: "Control Label"
  - Pre-filled with auto-generated label
  - Editable

- [ ] **Description** field:
  - Input type: textarea (2 rows)
  - Placeholder: "Brief description"
  - Optional
  - Editable

- [ ] **Bind to Parameter** field:
  - Input type: text
  - Placeholder: "parameter_name"
  - Pre-filled with auto-generated param
  - Help text visible
  - Editable

##### Type-Specific Properties

**For Slider:**
- [ ] Section header: "SLIDER Settings"
- [ ] **Minimum Value** field (number input)
- [ ] **Maximum Value** field (number input)
- [ ] **Step Size** field (number input)
- [ ] **Default Value** field (number input)
- [ ] **Show Value** checkbox

**For Button:**
- [ ] Section header: "BUTTON Settings"
- [ ] **Action** dropdown (Start/Stop/Reset/Custom)
- [ ] **Variant** dropdown (Primary/Secondary/Success/Danger)

**For Dropdown:**
- [ ] Section header: "DROPDOWN Settings"
- [ ] **Options** textarea (JSON format)
- [ ] Format example shown
- [ ] **Default Value** field

**For Checkbox:**
- [ ] Section header: "CHECKBOX Settings"
- [ ] **Default Checked** checkbox

**For Color Picker:**
- [ ] Section header: "COLOR_PICKER Settings"
- [ ] **Default Color** input (color picker)

**For Text Input:**
- [ ] Section header: "TEXT_INPUT Settings"
- [ ] **Placeholder** field
- [ ] **Default Value** field

##### Real-Time Updates
**Test: Edit Label**
1. [ ] Select control on canvas
2. [ ] Change "Label" to "Speed Control"
3. [ ] Canvas control updates immediately

**Test: Edit Parameter Binding**
1. [ ] Change "Bind To" to "speed"
2. [ ] Canvas badge updates to show "slider → speed"

##### Delete Control
- [ ] "Delete Control" button visible (red, at bottom)
- [ ] Click button → control removed from canvas
- [ ] Properties panel returns to empty state

---

#### E. Code Tab

##### Layout
- [ ] Code editor takes full width
- [ ] Header shows title and "Test Run" button

##### Code Sub-Tab
- [ ] Large textarea (full height)
- [ ] Default placeholder with Python example
- [ ] Can type/edit code
- [ ] Monospace font

##### Settings Sub-Tab
- [ ] **Language Selection**: Python/JavaScript buttons
- [ ] **Library Management**:
  - Shows current libraries as badges
  - Can add library (press Enter or click Add)
  - Can remove library (click × button)
- [ ] **Quick Add buttons** (Python): numpy, matplotlib, pandas, scipy

##### Test Run Button
- [ ] Click "Test Run" → opens preview modal

---

#### F. Visualization Tab

##### Visualization Type Cards
- [ ] Three cards display: Canvas, D3.js SVG, Plotly
- [ ] Each shows icon, label, description
- [ ] Click to select (blue highlight + checkmark)
- [ ] Only one selected at a time

##### Canvas Settings
- [ ] Width/Height fields (number inputs)
- [ ] Background Color (color picker + hex input)
- [ ] WebTurtle checkbox
- [ ] TurtleManager checkbox
- [ ] WebTurtle and TurtleManager mutually exclusive

---

#### G. Metadata Tab

##### Fields
- [ ] **Title** field (syncs with header)
- [ ] **Description** textarea (4 rows)
- [ ] **Category** dropdown (all categories listed)
- [ ] **Make public** checkbox

##### Real-Time Updates
- [ ] Edit title → header updates
- [ ] Edit category → updates

---

#### H. Preview Modal

##### Opening Preview
- [ ] Click "Show Preview" → modal appears
- [ ] Full-screen overlay (50% opacity)
- [ ] White modal window (90% viewport)

##### Modal Content
- [ ] Shows full playground renderer
- [ ] Left: All controls you added (functional)
- [ ] Right: Visualization (canvas renders, code executes)

##### Interactive Testing
**Test: Full Workflow**
1. [ ] Add Slider (Speed, 0-10)
2. [ ] Add Button (Start)
3. [ ] Write simple Python code using params
4. [ ] Open preview
5. [ ] Adjust slider → output updates
6. [ ] Everything works like student view

##### Closing Preview
- [ ] Click close button → modal closes
- [ ] Returns to builder

---

#### I. Save Functionality

⚠️ **NOT FULLY IMPLEMENTED** (Phase 4)

##### Current Behavior
- [ ] Click "Save" → alert appears
- [ ] Alert says: "API integration pending"
- [ ] Console logs playground object
- [ ] Nothing saves to database

---

## 🐛 Known Issues & Troubleshooting

### Common Issues

#### Issue 1: Pyodide Taking Long to Load
**Symptoms**: Blank canvas, "Loading..." for 10+ seconds

**Solution**: Wait 10-20 seconds on first load, check console

#### Issue 2: Canvas Not Rendering
**Symptoms**: White blank rectangle

**Solutions**:
- Wait for Pyodide to load
- Check output panel for Python errors
- Verify turtle_graphics is imported

#### Issue 3: Controls Not Responding
**Symptoms**: Sliders move but nothing updates

**Solutions**:
- Check parameter name matches code
- Wait 500ms (debounce delay)
- Check console for binding errors

#### Issue 4: Drag-and-Drop Not Working
**Symptoms**: Can't drag controls

**Solutions**:
- Use modern browser (Chrome/Firefox)
- Check console for errors
- Clear browser cache

### Console Errors

✅ **Safe to ignore**:
- React Hook dependency warnings
- Pyodide loading messages

❌ **Need to fix**:
- ModuleNotFoundError: turtle_graphics
- NameError: reset_output
- TypeError: Cannot read property

### Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Recommended |
| Firefox | ✅ Supported |
| Safari | ✅ Supported |
| Edge | ✅ Supported |
| IE 11 | ❌ Not supported |

---

## ✅ Success Criteria

### Minimum Viable Test
- [ ] Gallery loads and shows template
- [ ] Student view opens and runs simulation
- [ ] Sliders update simulation in real-time
- [ ] Builder loads without errors
- [ ] Can drag ONE control onto canvas
- [ ] Can edit control properties
- [ ] Preview modal opens

### Performance Benchmarks
- [ ] Gallery loads < 2 seconds
- [ ] Student view loads < 5 seconds
- [ ] Builder loads < 3 seconds
- [ ] Drag-and-drop responsive (< 100ms lag)
- [ ] Simulation runs at 30+ FPS

---

## 🎓 Demo Script for Stakeholders

### Part 1: Student Experience (3 min)

**Navigate to**: `/playgrounds`

**Say**: "Gallery where students browse topics. Search and filter by category."

**Click**: Braitenberg template

**Say**: "Interactive learning in browser. No installation needed."

**Demonstrate**: Adjust sliders, click Start, watch animation

**Say**: "Students learn by experimentation - change parameters, see results instantly."

---

### Part 2: Faculty Creation (5 min)

**Navigate to**: `/playgrounds/builder`

**Say**: "Builder for faculty. No coding required."

**Show**: Control palette

**Drag**: Slider onto canvas

**Say**: "Drag and drop controls. Easy as PowerPoint."

**Configure**: Edit properties

**Add**: Button

**Show**: Code tab (for advanced users)

**Preview**: Click preview button

**Say**: "Live preview shows exactly what students see."

---

### Part 3: The Vision (2 min)

**Examples**:
- Neural networks
- Physics simulations
- Algorithm visualizations
- Chemistry/Biology models

**Next Steps**:
- More templates (10-15 examples)
- Database integration
- Analytics dashboard
- LMS integration

**Goal**: "15 minutes to create what used to take days."

---

## 🚀 Next Steps After Testing

### Immediate (This Week)
1. [ ] Complete testing checklist
2. [ ] Document bugs found
3. [ ] Take screenshots
4. [ ] Gather faculty feedback

### Phase 4: API Integration
1. [ ] Database migration
2. [ ] Create API routes
3. [ ] Connect save button
4. [ ] Add authentication

### Phase 5: More Templates
- Neural Network Playground
- Sorting visualizers
- Physics simulations
- Data structures

### Future Enhancements
- Auto-save drafts
- Version history
- Collaborative editing
- Template marketplace
- Analytics dashboard
- LTI integration
- Mobile optimization

---

## 📚 Reference Documents

| Document | Location |
|----------|----------|
| **Architecture** | `/docs/PLAYGROUND_BUILDER_ARCHITECTURE.md` |
| **Status** | `/docs/IMPLEMENTATION_STATUS.md` |
| **Quick Start** | `/docs/PLAYGROUND_QUICK_START.md` |
| **Testing** | `/docs/PLAYGROUND_TESTING_GUIDE.md` |

---

## 🎯 Summary

✅ **Complete**: UI, drag-and-drop, real-time updates, Python execution, templates

❌ **Missing**: Database persistence, API routes, more templates

**Status**: ~50% complete, ready for Phase 4 (backend)

---

**Happy Testing! Document your findings and prepare for Phase 4!**
