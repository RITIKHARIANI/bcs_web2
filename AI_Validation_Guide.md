# AI Project Validation Checklist

## 🔍 **HOW TO VALIDATE AI IS DOING IT RIGHT**

Before the AI starts coding, ask it to provide these deliverables first:

### **Step 1: Architecture Plan**
Ask the AI: *"Before you start coding, provide a detailed architecture plan including:"*

- **Technology Stack Choice:** What frameworks, databases, and tools will you use and WHY?
- **Database Schema:** Complete database design with table structures and relationships
- **Project Structure:** Folder organization and file structure
- **Component Architecture:** How different parts of the system will work together
- **Media Handling:** How images, videos, and documents will be stored and served

### **Step 2: Implementation Timeline**
Ask the AI: *"Provide a step-by-step implementation plan:"*

- **Phase breakdown:** What will be built in each phase
- **Feature dependencies:** What needs to be built before what
- **Testing approach:** How each feature will be validated
- **Deployment strategy:** How the application will be hosted

### **Step 3: Workflow Validation**
Ask the AI to describe: *"Walk me through the complete user workflows:"*

**Faculty Workflow:**
1. Faculty registers and logs in
2. Faculty creates a module with content and media
3. Faculty creates submodules under that module
4. Faculty creates a course
5. Faculty adds existing modules to the course
6. Faculty publishes the course
7. Faculty can reuse the same modules in different courses

**Public User Workflow:**
1. User visits the site
2. User browses available courses
3. User clicks on a course and navigates through modules
4. User can view all media content (images, videos, documents)
5. User can search within course content

---

## 📋 **VALIDATION QUESTIONS TO ASK THE AI**

### **Before Coding Starts:**

**Technology Validation:**
- "Why did you choose [framework] over alternatives?"
- "How will you handle file uploads for media content?"
- "What database will you use and how will it handle the module-course relationship?"
- "How will you ensure the system can scale with many courses and modules?"

**Architecture Validation:**
- "Show me the database schema - how do modules relate to courses?"
- "How will you prevent the same module from being modified when used in multiple courses?"
- "What happens if a faculty member updates a module that's used in 5 different courses?"
- "How will you handle media file storage and delivery?"

**Workflow Validation:**
- "Walk me through creating a module that will be used in 3 different courses"
- "How does a faculty member add an existing module to a new course?"
- "What does the interface look like for organizing modules into courses?"
- "How do you ensure only faculty can create content but everyone can view published courses?"

### **During Development:**
- "Show me a working demo of [specific feature] before moving to the next one"
- "Can you create a test module with an image and video to verify media handling works?"
- "Create a sample course using the same module twice to test reusability"

---

## 🎯 **SPECIFIC REQUIREMENTS TO VALIDATE**

### **Module Reusability System:**
Ask the AI to confirm:
- **Separate Creation:** Modules are created independently, not inside courses
- **Course Assembly:** Courses are assembled by selecting existing modules
- **Content Integrity:** When a module is used in multiple courses, editing it updates everywhere OR creates versions
- **Organization:** Clear interface for managing standalone modules vs. organizing them into courses

### **Media Support Requirements:**
Ask the AI to confirm support for:
- **Images:** Upload, display, resize, optimize
- **Videos:** Upload, streaming, multiple formats
- **Documents:** PDFs, Word docs, presentations
- **Interactive Content:** Embedded demos, external links
- **File Management:** Organize, delete, replace media files

### **Database Design Validation:**
Ask the AI to show:
```sql
-- Example of what you should see:
Tables: modules, courses, course_modules (junction table), media_files
- modules table: stores module content independently
- courses table: stores course information
- course_modules table: links modules to courses (many-to-many relationship)
- media_files table: stores uploaded media with references
```

---

## ✅ **RED FLAGS TO WATCH FOR**

### **Architecture Red Flags:**
- ❌ Modules are created inside courses (should be independent)
- ❌ No clear media upload/management system
- ❌ Database doesn't support many-to-many module-course relationships
- ❌ No consideration for file storage and serving

### **Workflow Red Flags:**
- ❌ Faculty must create modules within a specific course
- ❌ No way to reuse existing modules in new courses
- ❌ Editing a module affects only one course instead of all courses using it
- ❌ No media upload interface for faculty

### **Technical Red Flags:**
- ❌ Choosing technologies without explaining why
- ❌ No plan for handling file uploads and storage
- ❌ Database design that doesn't support module reusability
- ❌ No consideration for responsive design and mobile access

---

## 📝 **VALIDATION PROMPT TEMPLATE**

Use this exact prompt to validate the AI's approach:

```
"Before you start coding, I need you to provide:

1. ARCHITECTURE PLAN: Technology stack, database schema, project structure, and media handling approach

2. WORKFLOW DESCRIPTION: Detailed step-by-step process for:
   - Faculty creating standalone modules with media content
   - Faculty creating courses by selecting existing modules  
   - Public users accessing and viewing course content with media

3. DATABASE DESIGN: Show me the exact table structure that supports:
   - Independent module creation
   - Module reusability across multiple courses
   - Media file storage and references
   - Faculty authentication

4. KEY DECISIONS: Explain your choices for:
   - Web framework and why
   - Database and why  
   - File storage approach
   - How module-course relationships work

Only after I approve this plan should you start writing code."
```

This ensures the AI builds exactly what you need before writing a single line of code!
