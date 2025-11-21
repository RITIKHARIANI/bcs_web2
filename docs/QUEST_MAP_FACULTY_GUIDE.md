# Quest Map Faculty Guide

This guide explains how to use the Quest Map system to create engaging, gamified learning experiences for students.

## Table of Contents

1. [Overview](#overview)
2. [Module Quest Map Settings](#module-quest-map-settings)
3. [Visual Quest Map Editor](#visual-quest-map-editor)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Overview

The Quest Map system transforms your modules into an interactive learning journey. Students see modules as "quests" they can complete, earning XP and achievements along the way.

### Key Features

- **Gamification**: Modules award XP and track progress
- **Prerequisites**: Control learning path by requiring modules to be completed first
- **Difficulty Levels**: Visual indicators help students understand complexity
- **Quest Types**: Different module types (standard, challenge, boss, bonus)
- **Visual Map**: Interactive map showing the learning journey

---

## Module Quest Map Settings

When editing a module, you'll find the **Quest Map Settings** card in the Settings tab.

### Prerequisites

**What**: Modules that must be completed before this one.

**How**: Check the boxes next to modules that should be prerequisites. Students won't be able to access this module until all prerequisites are completed.

**Example**: A "React Hooks" module might require "React Basics" as a prerequisite.

**Tips**:
- Don't create circular dependencies (A requires B, B requires A)
- Keep prerequisite chains reasonable (3-4 levels max)
- Use prerequisites to enforce learning progression

### XP Reward

**What**: Experience points awarded when students complete this module.

**Range**: 0-10,000 XP

**Guidelines**:
- **Quick reads (10-15 min)**: 50-100 XP
- **Standard lessons (30-45 min)**: 100-200 XP
- **In-depth tutorials (1-2 hours)**: 200-500 XP
- **Challenge modules**: 300-750 XP
- **Boss modules**: 500-1,000 XP
- **Major projects**: 1,000+ XP

**Tip**: Keep XP rewards consistent relative to effort and complexity.

### Difficulty Level

**What**: Visual indicator of module complexity.

**Options**:
- **Beginner** (Green): Introductory content, assumes no prior knowledge
- **Intermediate** (Blue): Builds on basics, requires some foundation
- **Advanced** (Orange): Complex topics, requires solid understanding
- **Boss** (Red/Purple): Challenging capstone content, comprehensive assessment

**Tip**: Use difficulty to help students self-assess readiness.

### Estimated Time

**What**: Expected completion time in minutes (optional).

**Range**: 0-999 minutes

**Purpose**: Helps students plan their study sessions.

**Tip**: Be realistic. Include time for reading, exercises, and reflection.

### Quest Type

**What**: Categorizes the module's purpose in the learning journey.

**Options**:
- **Standard**: Regular learning module (📚)
- **Challenge**: Practice exercises and challenges (⚡)
- **Boss**: Major assessment or capstone project (👑)
- **Bonus**: Optional enrichment content (⭐)

**Tip**: Use varied quest types to keep the learning experience engaging.

### Map Position

**What**: Location on the quest map grid (X and Y coordinates, 0-100%).

**How**:
- **X**: Horizontal position (0 = left, 100 = right)
- **Y**: Vertical position (0 = top, 100 = bottom)

**Tip**: Don't worry too much about precise positioning here. Use the Visual Quest Map Editor for easier layout.

---

## Visual Quest Map Editor

Access the visual editor at: **Faculty Dashboard → Quest Map**

### Interface Overview

**Map Canvas**: Large grid showing all published modules as colored circles.

**Sidebar**: Click a module to view/edit its prerequisites.

**Controls**:
- **Auto-Layout**: Automatically organize modules based on dependencies
- **Save Layout**: Save position and prerequisite changes

### Using the Editor

#### 1. Positioning Modules

**Drag and Drop**:
1. Click and hold on a module circle
2. Drag to desired position
3. Release to place

**Tips**:
- Arrange left-to-right: Foundation → Intermediate → Advanced
- Group related modules vertically
- Keep prerequisites to the left of dependent modules
- Use Auto-Layout as a starting point

#### 2. Setting Prerequisites

**Using the Sidebar**:
1. Click on a module to select it
2. Sidebar shows module details and XP
3. Scroll through the prerequisite list
4. Check boxes for required modules
5. Changes save when you click "Save Layout"

**Visual Feedback**:
- Selected module has a yellow ring
- Blue lines connect prerequisites to dependent modules
- Module shows "X prereq" if it has prerequisites

#### 3. Understanding the Visual Design

**Colors** (Difficulty):
- 🟢 Green: Beginner
- 🔵 Blue: Intermediate
- 🟠 Orange: Advanced
- 🔴 Red/Purple: Boss

**Icons** (Quest Type):
- 📚 Standard
- ⚡ Challenge
- 👑 Boss
- ⭐ Bonus

#### 4. Auto-Layout

**When to Use**:
- Starting from scratch
- Too many overlapping modules
- Want to reorganize by dependencies

**How It Works**:
- Calculates "depth" of each module (how many prerequisites in chain)
- Arranges modules left-to-right by depth
- Spaces modules vertically within each depth level

**After Auto-Layout**:
- Review the layout
- Adjust positions manually for better visual flow
- Click "Save Layout" when satisfied

### Validation

The editor validates your prerequisite structure before saving:

**Prevents**:
- ❌ Circular dependencies (A → B → C → A)
- ❌ References to non-existent modules
- ❌ Self-prerequisites (module requires itself)

**Error Messages**: If validation fails, you'll see specific errors to fix.

---

## Best Practices

### Designing Learning Paths

1. **Start Simple**: Begin with foundational modules (beginner difficulty, few/no prerequisites)

2. **Build Progressively**: Each level should build on previous ones
   ```
   Beginner → Intermediate → Advanced → Boss
   ```

3. **Branch Paths**: Allow multiple valid learning routes
   ```
   Foundation
   ├─→ Path A → Advanced A
   └─→ Path B → Advanced B
   ```

4. **Avoid Deep Chains**: Keep prerequisite chains to 3-4 levels max
   - ✅ Good: A → B → C → D
   - ❌ Too deep: A → B → C → D → E → F → G

### XP Economy

1. **Consistency**: Similar difficulty/length modules should award similar XP

2. **Progression**: Later modules can award more XP to maintain motivation

3. **Bonus Content**: Optional modules can award bonus XP (150% of standard)

4. **Boss Rewards**: Major assessments should feel rewarding (2-3x standard XP)

### Quest Map Layout

1. **Left to Right**: Learning progression flows naturally left to right

2. **Visual Grouping**: Use vertical space to group related topics

3. **Clear Paths**: Prerequisite lines should be easy to follow

4. **Balanced Spacing**: Avoid clustering; use the full canvas

5. **Boss Placement**: Put major assessments at logical endpoints

### Student Experience

1. **Set Expectations**: Use estimated time and difficulty consistently

2. **Provide Context**: Module descriptions should explain prerequisites

3. **Offer Choice**: When possible, give students multiple valid paths

4. **Celebrate Progress**: Use boss modules as major milestones

---

## Troubleshooting

### Common Issues

#### "Circular dependency detected"

**Problem**: Module A requires B, B requires C, C requires A (or similar loop)

**Solution**:
1. Identify the loop from the error message
2. Decide which dependency to remove
3. Update prerequisites in the Visual Editor
4. Save and retry

#### "Module not appearing on quest map"

**Problem**: Only published modules appear on the quest map

**Solution**:
1. Go to the module edit page
2. Check the Publishing Settings
3. Change status from "Draft" to "Published"
4. Save the module

#### "Students can't access a module"

**Checklist**:
- [ ] Module is published?
- [ ] Module visibility is "Public"?
- [ ] All prerequisites are completed by the student?
- [ ] Module is included in the course (if viewing through course)?

#### "Quest map layout looks cluttered"

**Solutions**:
1. Click "Auto-Layout" to reset positioning
2. Manually spread out overlapping modules
3. Reduce the number of prerequisites per module
4. Group related modules vertically

#### "Positions not saving"

**Checklist**:
- [ ] Clicked "Save Layout" button?
- [ ] No validation errors?
- [ ] Browser console shows no errors?
- [ ] Sufficient permissions (faculty access)?

---

## FAQs

**Q: Do I need to set quest map properties for every module?**

A: No. Modules have sensible defaults (100 XP, beginner difficulty, position 50/50). Set these when you want to create a cohesive quest map experience.

**Q: Can students see the quest map?**

A: Yes! Students see an interactive quest map at:
- `/courses/[slug]/quest-map` (when viewing a course)
- `/modules/quest-map` (public quest map of all modules)

**Q: What happens if I change prerequisites after students have started?**

A: Already-completed modules remain completed. New prerequisites only affect modules students haven't started yet.

**Q: Can I have multiple "boss" modules?**

A: Yes! Use boss modules for major assessments at different points in the learning journey.

**Q: How do I remove all prerequisites from a module?**

A: In the Visual Editor, select the module and uncheck all checkboxes in the sidebar.

**Q: Can prerequisites span across courses?**

A: Yes! Prerequisites are at the module level, so you can require modules from different courses.

---

## Support

For additional help:
- Check the [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- Review the [Quest Map Implementation Plan](./QUEST_MAP_IMPLEMENTATION_PLAN.md)
- Contact your technical support team

---

**Last Updated**: January 2025
**Version**: 1.0
