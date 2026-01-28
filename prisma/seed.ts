import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Cleanup existing data
  await prisma.score.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.config.deleteMany()

  console.log('✅ Cleaned up existing data')

  // 2. Create Users (评委)
  const users = [
    { id: "01", name: "主任1", role: "LEADER", department: "中心领导", passcode: "1234" },
    { id: "02", name: "主任2", role: "LEADER", department: "中心领导", passcode: "1234" },
    { id: "03", name: "主任3", role: "LEADER", department: "中心领导", passcode: "1234" },
    { id: "04", name: "总工1", role: "LEADER", department: "总工/副总工工程师", passcode: "1234" },
    { id: "05", name: "总工2", role: "LEADER", department: "总工/副总工工程师", passcode: "1234" },
    { id: "06", name: "数字经济研究所", role: "DEPT_HEAD", department: "数字经济研究所", passcode: "1234" },
    { id: "07", name: "生物经济研究所", role: "DEPT_HEAD", department: "生物经济研究所", passcode: "1234" },
    { id: "08", name: "能源经济研究所", role: "DEPT_HEAD", department: "能源经济研究所", passcode: "1234" },
    { id: "09", name: "绿色经济研究所", role: "DEPT_HEAD", department: "绿色经济研究所", passcode: "1234" },
    { id: "10", name: "新材料产业研究所", role: "DEPT_HEAD", department: "新材料产业研究所", passcode: "1234" },
    { id: "11", name: "海洋经济研究所", role: "DEPT_HEAD", department: "海洋经济研究所", passcode: "1234" },
    { id: "12", name: "重大科技基础设施部", role: "DEPT_HEAD", department: "重大科技基础设施部", passcode: "1234" },
    { id: "13", name: "创新发展部", role: "DEPT_HEAD", department: "创新发展部", passcode: "1234" },
    { id: "14", name: "轨道交通与城市发展研究所", role: "DEPT_HEAD", department: "轨道交通与城市发展研究所", passcode: "1234" },
    { id: "15", name: "经济运行研究所", role: "DEPT_HEAD", department: "经济运行研究所", passcode: "1234" },
    { id: "16", name: "改革创新研究所", role: "DEPT_HEAD", department: "改革创新研究所", passcode: "1234" },
    { id: "17", name: "服务业与社会民生研究所", role: "DEPT_HEAD", department: "服务业与社会民生研究所", passcode: "1234" },
    { id: "18", name: "区域发展研究所", role: "DEPT_HEAD", department: "区域发展研究所", passcode: "1234" },
    { id: "19", name: "战略发展与项目管理部", role: "DEPT_HEAD", department: "战略发展与项目管理部", passcode: "1234" }
  ]

  // 3. Create Projects (待评项目)
  const projects = [
    { id: "p01", name: "深圳数字经济发展战略研究", department: "数字经济研究所", presenter: "张三", description: "研究深圳数字经济发展趋势与战略规划" },
    { id: "p02", name: "生物医药产业集群发展路径研究", department: "生物经济研究所", presenter: "李四", description: "生物医药产业园区布局与发展策略" },
    { id: "p03", name: "新能源汽车产业链优化研究", department: "能源经济研究所", presenter: "王五", description: "新能源汽车产业链本地化发展研究" },
    { id: "p04", name: "碳达峰碳中和路径与政策研究", department: "绿色经济研究所", presenter: "赵六", description: "双碳目标下的绿色转型策略" },
    { id: "p05", name: "先进材料产业发展规划研究", department: "新材料产业研究所", presenter: "钱七", description: "新材料产业布局与技术攻关方向" },
    { id: "p06", name: "深圳海洋经济高质量发展研究", department: "海洋经济研究所", presenter: "孙八", description: "海洋经济新兴产业培育与发展" },
    { id: "p07", name: "低空经济产业发展与基础设施规划", department: "重大科技基础设施部 (低空经济研究中心)", presenter: "周九", description: "低空经济应用场景与基础设施建设" },
    { id: "p08", name: "科技创新政策体系优化研究", department: "创新发展部", presenter: "吴十", description: "科技创新政策评估与优化建议" },
    { id: "p09", name: "轨道交通TOD综合开发模式研究", department: "轨道交通与城市发展研究所", presenter: "郑一", description: "轨道交通沿线城市更新与开发" },
    { id: "p10", name: "深圳经济运行监测预警体系研究", department: "经济运行研究所", presenter: "冯二", description: "经济运行监测指标与预警机制" },
    { id: "p11", name: "深化综合改革试点方案研究", department: "改革创新研究所", presenter: "陈三", description: "综合改革试点重点领域与实施路径" },
    { id: "p12", name: "公共服务均等化发展研究", department: "服务业与社会民生研究所", presenter: "褚四", description: "教育医疗等公共服务资源配置优化" },
    { id: "p13", name: "区域协调发展战略研究", department: "区域发展研究所", presenter: "卫五", description: "粤港澳大湾区协同发展策略" }
  ]

  // Insert data
  for (const u of users) {
    await prisma.user.create({ data: u })
  }
  console.log(`✅ Created ${users.length} users`)

  for (const p of projects) {
    await prisma.project.create({ data: p })
  }
  console.log(`✅ Created ${projects.length} projects`)

  // Initialize config
  await prisma.config.create({
    data: { key: 'scoring_state', value: 'CLOSED' }
  })
  console.log('✅ Initialized config')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
