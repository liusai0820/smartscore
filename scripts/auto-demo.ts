
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Auto-Demo Setup...')

  // 1. Reset Scores
  console.log('Clearing existing scores...')
  await prisma.score.deleteMany()

  // 2. Set State to SCORING
  console.log('Opening Scoring...')
  await prisma.config.upsert({
    where: { key: 'scoring_state' },
    update: { value: 'SCORING' },
    create: { key: 'scoring_state', value: 'SCORING' }
  })

  // 3. Get Projects and Users
  const projects = await prisma.project.findMany({ take: 5 }) // Simulate first 5 projects
  const users = await prisma.user.findMany()

  console.log(`Found ${projects.length} projects and ${users.length} users.`)

  // 4. Simulate voting for each project (DIKI范式6维度)
  for (const project of projects) {
    console.log(`\nCurrent Project: ${project.name}`)

    // Set as current project
    await prisma.config.upsert({
      where: { key: 'current_project' },
      update: { value: project.id },
      create: { key: 'current_project', value: project.id }
    })

    // Vote
    console.log('   Casting votes...')
    for (const user of users) {
      if (user.department === project.department) continue // Conflict

      // Random scores for DIKI 6 dimensions
      const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

      // DIKI范式评分 (注意不同维度有不同的满分)
      // Data (20), Info (15), Know (15), Insight (20), Approval (15), Award (15)
      let scores = {
        data: rand(12, 18),      // max 20
        info: rand(9, 14),       // max 15
        know: rand(9, 14),       // max 15
        insight: rand(12, 18),   // max 20
        approval: rand(5, 12),   // max 15
        award: rand(3, 10)       // max 15
      }

      // Add some variance based on user role
      if (user.role === 'LEADER') {
        scores.data -= 1
        scores.insight -= 1
      }

      await prisma.score.create({
        data: {
          userId: user.id,
          projectId: project.id,
          dataScore: Math.max(1, Math.min(20, scores.data)),
          infoScore: Math.max(1, Math.min(15, scores.info)),
          knowScore: Math.max(1, Math.min(15, scores.know)),
          insightScore: Math.max(1, Math.min(20, scores.insight)),
          approvalScore: Math.max(1, Math.min(15, scores.approval)),
          awardScore: Math.max(1, Math.min(15, scores.award))
        }
      })
    }
  }

  // 5. Reveal Results
  console.log('\nRevealing Results...')
  await prisma.config.update({
    where: { key: 'scoring_state' },
    data: { value: 'REVEALED' }
  })

  console.log('Demo Setup Complete! Go to /display to see the DIKI dimension stats.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
