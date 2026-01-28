
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Get the current active project from config
  const projectConfig = await prisma.config.findUnique({ where: { key: 'current_project' } })
  const stateConfig = await prisma.config.findUnique({ where: { key: 'scoring_state' } })

  if (stateConfig?.value !== 'SCORING') {
    console.error('Error: System is not in SCORING state. Please start scoring in Admin panel first.')
    return
  }

  const projectId = projectConfig?.value
  if (!projectId) {
    console.error('Error: No project is currently selected.')
    return
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    console.error('Error: Project not found.')
    return
  }

  console.log(`Simulating votes for project: ${project.name} (${project.department})`)

  // 2. Get all users
  const users = await prisma.user.findMany()

  // 3. Simulate votes with DIKI 6 dimensions
  let votedCount = 0
  let skippedCount = 0

  for (const user of users) {
    // Check conflict
    if (user.department === project.department) {
      console.log(`  - Skipping ${user.name} (Conflict: Same Department)`)
      skippedCount++
      continue
    }

    // Check if already voted
    const existing = await prisma.score.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      }
    })

    if (existing) {
      console.log(`  - Skipping ${user.name} (Already voted)`)
      continue
    }

    // Generate random DIKI scores
    // Different max values: Data/Insight=20, others=15
    const randomScore = (max: number) => {
      const base = Math.floor(max * 0.6) // Start from 60% of max
      const range = Math.floor(max * 0.35) // Add up to 35% more
      return base + Math.floor(Math.random() * range)
    }

    const scores = {
      dataScore: randomScore(20),      // max 20
      infoScore: randomScore(15),      // max 15
      knowScore: randomScore(15),      // max 15
      insightScore: randomScore(20),   // max 20
      approvalScore: randomScore(15),  // max 15
      awardScore: randomScore(15)      // max 15
    }

    await prisma.score.create({
      data: {
        userId: user.id,
        projectId: projectId,
        ...scores
      }
    })

    votedCount++
  }

  console.log(`\nSimulation Complete!`)
  console.log(`   - Voted: ${votedCount}`)
  console.log(`   - Skipped (Conflict): ${skippedCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
