const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkModules() {
  try {
    console.log('=== All Modules ===')
    const modules = await prisma.module.findMany({
      select: {
        id: true,
        title: true,
        parentModuleId: true,
        authorId: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    console.log('Total modules:', modules.length)
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`)
      console.log(`   ID: ${module.id}`)
      console.log(`   Parent: ${module.parentModuleId || 'None (Root)'}`)
      console.log(`   Author: ${module.authorId}`)
      console.log('---')
    })

    console.log('\n=== Users ===')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log('---')
    })

    console.log('\n=== Module Tree ===')
    const rootModules = modules.filter(m => !m.parentModuleId)
    const printTree = (modules, parentId, indent = 0) => {
      const children = modules.filter(m => m.parentModuleId === parentId)
      children.forEach(child => {
        console.log('  '.repeat(indent) + `- ${child.title} (${child.id})`)
        printTree(modules, child.id, indent + 1)
      })
    }
    
    rootModules.forEach(root => {
      console.log(`ROOT: ${root.title} (${root.id})`)
      printTree(modules, root.id, 1)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkModules()
