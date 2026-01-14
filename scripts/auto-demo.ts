
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎬 Starting Auto-Demo Setup...')

  // 1. Reset Scores
  console.log('🧹 Clearing existing scores...')
  await prisma.score.deleteMany()

  // 2. Set State to SCORING
  console.log('🔓 Opening Scoring...')
  await prisma.config.upsert({
    where: { key: 'scoring_state' },
    update: { value: 'SCORING' },
    create: { key: 'scoring_state', value: 'SCORING' }
  })

  // 3. Get Projects and Users
  const projects = await prisma.project.findMany({ take: 5 }) // Simulate first 5 projects
  const users = await prisma.user.findMany()

  console.log(`📊 Found ${projects.length} projects and ${users.length} users.`)

  // 4. Simulate voting for each project
  for (const project of projects) {
    console.log(`\n👉 Current Project: ${project.name}`)

    // Set as current project
    await prisma.config.upsert({
      where: { key: 'current_project' },
      update: { value: project.id },
      create: { key: 'current_project', value: project.id }
    })

    // Vote
    console.log('   🗳️  Casting votes...')
    for (const user of users) {
      if (user.department === project.department) continue // Conflict

      // Random scores with some character
      // Project 1: High Value, Low Feasibility
      // Project 2: High Innovation, Low Output
      // Others: Random
      let scores = { v: 8, i: 8, f: 8, o: 8 }

      const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

      if (project.id === projects[0].id) {
        scores = { v: rand(9, 10), i: rand(8, 9), f: rand(5, 7), o: rand(7, 8) }
      } else if (project.id === projects[1].id) {
        scores = { v: rand(7, 8), i: rand(9, 10), f: rand(6, 8), o: rand(6, 7) }
      } else {
         scores = { v: rand(7, 10), i: rand(7, 10), f: rand(7, 10), o: rand(7, 10) }
      }

      // Add some variance based on user role to test consistency
      // Leaders score strictly, DeptHeads loosely
      if (user.role === 'LEADER') {
        scores.v -= 1
        scores.f -= 1
      }

      await prisma.score.create({
        data: {
          userId: user.id,
          projectId: project.id,
          valueScore: Math.max(1, scores.v),
          innovScore: Math.max(1, scores.i),
          feasiScore: Math.max(1, scores.f),
          outputScore: Math.max(1, scores.o)
        }
      })
    }
  }

  // 5. Reveal Results
  console.log('\n🏆 Revealing Results...')
  await prisma.config.update({
    where: { key: 'scoring_state' },
    data: { value: 'REVEALED' }
  })

  console.log('✅ Demo Setup Complete! Go to /display to see the multi-dimension stats.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
