import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 1. Cleanup existing data
  await prisma.score.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.config.deleteMany()

  console.log('Cleaned up existing data')

  // 2. Create Users (评委) - 只初始化评审员，不包含项目
  const users = [
    { id: "01", name: "康主任", role: "LEADER", department: "中心领导", passcode: "1234" },
    { id: "02", name: "陈主任", role: "LEADER", department: "中心领导", passcode: "1234" },
    { id: "03", name: "马书记", role: "LEADER", department: "中心领导", passcode: "1234" },
    { id: "04", name: "李主任", role: "LEADER", department: "中心领导", passcode: "1234" },

    { id: "05", name: "陈总工", role: "LEADER", department: "总工", passcode: "1234" },
    { id: "06", name: "数字经济研究所", role: "DEPT_HEAD", department: "数字经济研究所", passcode: "1234" },
    { id: "07", name: "生物经济研究所", role: "DEPT_HEAD", department: "生物经济研究所", passcode: "1234" },
    { id: "08", name: "能源经济研究所", role: "DEPT_HEAD", department: "能源经济研究所", passcode: "1234" },
    { id: "09", name: "绿色经济研究所", role: "DEPT_HEAD", department: "绿色经济研究所", passcode: "1234" },
    { id: "10", name: "新材料产业研究所", role: "DEPT_HEAD", department: "新材料产业研究所", passcode: "1234" },
    { id: "11", name: "海洋经济研究所", role: "DEPT_HEAD", department: "海洋经济研究所", passcode: "1234" },
    { id: "12", name: "重大科技基础设施部(低空经济研究所)", role: "DEPT_HEAD", department: "重大科技基础设施部(低空经济研究所)", passcode: "1234" },
    { id: "13", name: "创新发展部", role: "DEPT_HEAD", department: "创新发展部", passcode: "1234" },
    { id: "14", name: "轨道交通与城市发展研究所", role: "DEPT_HEAD", department: "轨道交通与城市发展研究所", passcode: "1234" },
    { id: "15", name: "经济运行研究所", role: "DEPT_HEAD", department: "经济运行研究所", passcode: "1234" },
    { id: "16", name: "改革创新研究所", role: "DEPT_HEAD", department: "改革创新研究所", passcode: "1234" },
    { id: "17", name: "服务业与社会民生研究所", role: "DEPT_HEAD", department: "服务业与社会民生研究所", passcode: "1234" },
    { id: "18", name: "区域发展研究所", role: "DEPT_HEAD", department: "区域发展研究所", passcode: "1234" },
    { id: "19", name: "战略发展与项目管理部", role: "DEPT_HEAD", department: "战略发展与项目管理部", passcode: "1234" }
  ]

  // 注意：不再默认创建项目，项目数据需要通过管理后台上传或使用"加载模拟数据"功能

  // Insert users
  for (const u of users) {
    await prisma.user.create({ data: u })
  }
  console.log(`Created ${users.length} users`)

  // Initialize config
  await prisma.config.create({
    data: { key: 'scoring_state', value: 'CLOSED' }
  })
  console.log('Initialized config')

  console.log('Seed completed! (No projects loaded - use admin panel to upload or load mock data)')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
