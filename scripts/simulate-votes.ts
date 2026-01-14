
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Get the current active project from config
  const projectConfig = await prisma.config.findUnique({ where: { key: 'current_project' } })
  const stateConfig = await prisma.config.findUnique({ where: { key: 'scoring_state' } })

  if (stateConfig?.value !== 'SCORING') {
    console.error('❌ Error: System is not in SCORING state. Please start scoring in Admin panel first.')
    return
  }

  const projectId = projectConfig?.value
  if (!projectId) {
    console.error('❌ Error: No project is currently selected.')
    return
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    console.error('❌ Error: Project not found.')
    return
  }

  console.log(`🚀 Simulating votes for project: ${project.name} (${project.department})`)

  // 2. Get all users
  const users = await prisma.user.findMany()

  // 3. Simulate votes
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

    // Generate random scores (7-10 range mostly, occasionally lower)
    // Bias towards 8 and 9
    const randomScore = () => {
      const r = Math.random()
      if (r > 0.8) return 10
      if (r > 0.4) return 9
      if (r > 0.1) return 8
      return 7
    }

    const scores = {
      valueScore: randomScore(),
      innovScore: randomScore(),
      feasiScore: randomScore(),
      outputScore: randomScore()
    }

    await prisma.score.create({
      data: {
        userId: user.id,
        projectId: projectId,
        ...scores
      }
    })

    votedCount++
    // Small delay to make it feel "live" if watching the screen (optional, removed for speed)
  }

  console.log(`\n✅ Simulation Complete!`)
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
