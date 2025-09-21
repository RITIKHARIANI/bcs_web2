-- Quick Database Analysis for Network Visualization Edge Issues
-- Run this directly in Supabase SQL Editor

-- 1. Check table counts
SELECT 
    'courses' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
FROM courses
UNION ALL
SELECT 
    'modules' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
FROM modules
UNION ALL
SELECT 
    'course_modules' as table_name,
    COUNT(*) as total_count,
    NULL as published_count
FROM course_modules;

-- 2. Check for published courses and their modules
SELECT 
    c.id as course_id,
    c.title as course_title,
    c.status as course_status,
    COUNT(cm.id) as total_modules,
    COUNT(CASE WHEN m.status = 'published' THEN 1 END) as published_modules
FROM courses c
LEFT JOIN course_modules cm ON c.id = cm.course_id
LEFT JOIN modules m ON cm.module_id = m.id
WHERE c.status = 'published'
GROUP BY c.id, c.title, c.status
ORDER BY c.created_at DESC;

-- 3. Check module hierarchy (parent-child relationships)
SELECT 
    parent.id as parent_id,
    parent.title as parent_title,
    parent.status as parent_status,
    child.id as child_id,
    child.title as child_title,
    child.status as child_status
FROM modules parent
INNER JOIN modules child ON parent.id = child.parent_module_id
WHERE parent.status = 'published' AND child.status = 'published'
ORDER BY parent.title, child.title;

-- 4. Identify potential issues
SELECT 
    'Courses without published modules' as issue,
    COUNT(*) as count
FROM courses c
WHERE c.status = 'published'
AND NOT EXISTS (
    SELECT 1 FROM course_modules cm 
    INNER JOIN modules m ON cm.module_id = m.id 
    WHERE cm.course_id = c.id AND m.status = 'published'
)
UNION ALL
SELECT 
    'Orphaned modules (parent not found)' as issue,
    COUNT(*) as count
FROM modules child
WHERE child.parent_module_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM modules parent 
    WHERE parent.id = child.parent_module_id
)
UNION ALL
SELECT 
    'Published modules with unpublished parents' as issue,
    COUNT(*) as count
FROM modules child
INNER JOIN modules parent ON child.parent_module_id = parent.id
WHERE child.status = 'published' AND parent.status != 'published';

-- 5. Sample course-module relationships that should create edges
SELECT 
    c.title as course_title,
    m.title as module_title,
    'course-' || c.id || '-module-' || m.id as edge_id,
    'course-' || c.id as edge_source,
    'module-' || m.id as edge_target
FROM courses c
INNER JOIN course_modules cm ON c.id = cm.course_id
INNER JOIN modules m ON cm.module_id = m.id
WHERE c.status = 'published' AND m.status = 'published'
ORDER BY c.title, cm.sort_order
LIMIT 10;

-- 6. Check for any users (authors)
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'faculty' THEN 1 END) as faculty_users
FROM users;
