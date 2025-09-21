// Debug script to analyze network visualization data
async function debugNetworkVisualization() {
  try {
    const response = await fetch('https://bcs-web2.vercel.app/api/public/network-visualization');
    const data = await response.json();
    
    console.log('=== NETWORK VISUALIZATION DEBUG ===');
    console.log(`Courses: ${data.courses?.length || 0}`);
    console.log(`Modules: ${data.modules?.length || 0}`);
    
    // Analyze course data
    if (data.courses && data.courses.length > 0) {
      const course = data.courses[0];
      console.log('\n--- COURSE DATA ---');
      console.log(`Course ID: ${course.id}`);
      console.log(`Course Title: ${course.title}`);
      console.log(`Course Modules: ${course.courseModules?.length || 0}`);
      
      if (course.courseModules && course.courseModules.length > 0) {
        console.log('\n--- COURSE MODULE RELATIONSHIPS ---');
        course.courseModules.forEach((cm, index) => {
          console.log(`CourseModule ${index + 1}:`);
          console.log(`  - CM ID: ${cm.id}`);
          console.log(`  - Module ID: ${cm.module?.id}`);
          console.log(`  - Module Title: ${cm.module?.title}`);
          console.log(`  - Expected Edge: course-${course.id} -> module-${cm.module?.id}`);
        });
      }
    }
    
    // Analyze module data
    if (data.modules && data.modules.length > 0) {
      console.log('\n--- MODULE DATA ---');
      data.modules.forEach((module, index) => {
        console.log(`Module ${index + 1}:`);
        console.log(`  - ID: ${module.id}`);
        console.log(`  - Title: ${module.title}`);
        console.log(`  - Parent: ${module.parentModuleId || 'none'}`);
        console.log(`  - Expected Node ID: module-${module.id}`);
      });
    }
    
    // Simulate edge creation
    console.log('\n--- SIMULATED EDGE CREATION ---');
    const courseModuleEdges = [];
    const moduleParentEdges = [];
    
    (data.courses || []).forEach((course) => {
      (course.courseModules || []).forEach((cm) => {
        if (cm.module?.id) {
          const edge = {
            id: `course-${course.id}-module-${cm.module.id}`,
            source: `course-${course.id}`,
            target: `module-${cm.module.id}`,
            type: 'smoothstep'
          };
          courseModuleEdges.push(edge);
          console.log(`Created edge: ${edge.source} -> ${edge.target}`);
        }
      });
    });
    
    (data.modules || []).forEach((module) => {
      if (module.parentModuleId) {
        const edge = {
          id: `module-${module.parentModuleId}-module-${module.id}`,
          source: `module-${module.parentModuleId}`,
          target: `module-${module.id}`,
          type: 'smoothstep'
        };
        moduleParentEdges.push(edge);
        console.log(`Created parent-child edge: ${edge.source} -> ${edge.target}`);
      }
    });
    
    console.log(`\nTotal course-module edges: ${courseModuleEdges.length}`);
    console.log(`Total parent-child edges: ${moduleParentEdges.length}`);
    console.log(`Total edges: ${courseModuleEdges.length + moduleParentEdges.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// If running in Node.js
if (typeof window === 'undefined') {
  const fetch = require('node-fetch');
  debugNetworkVisualization();
}
