import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// 模拟项目数据
const MOCK_PROJECTS = [
    { name: "深圳数字经济发展战略研究", department: "数字经济研究所", presenter: "张三", description: "研究深圳数字经济发展趋势与战略规划" },
    { name: "生物医药产业集群发展路径研究", department: "生物经济研究所", presenter: "李四", description: "生物医药产业园区布局与发展策略" },
    { name: "新能源汽车产业链优化研究", department: "能源经济研究所", presenter: "王五", description: "新能源汽车产业链本地化发展研究" },
    { name: "碳达峰碳中和路径与政策研究", department: "绿色经济研究所", presenter: "赵六", description: "双碳目标下的绿色转型策略" },
    { name: "先进材料产业发展规划研究", department: "新材料产业研究所", presenter: "钱七", description: "新材料产业布局与技术攻关方向" },
    { name: "深圳海洋经济高质量发展研究", department: "海洋经济研究所", presenter: "孙八", description: "海洋经济新兴产业培育与发展" },
    { name: "低空经济产业发展与基础设施规划", department: "重大科技基础设施部 (低空经济研究中心)", presenter: "周九", description: "低空经济应用场景与基础设施建设" },
    { name: "科技创新政策体系优化研究", department: "创新发展部", presenter: "吴十", description: "科技创新政策评估与优化建议" },
    { name: "轨道交通TOD综合开发模式研究", department: "轨道交通与城市发展研究所", presenter: "郑一", description: "轨道交通沿线城市更新与开发" },
    { name: "深圳经济运行监测预警体系研究", department: "经济运行研究所", presenter: "冯二", description: "经济运行监测指标与预警机制" },
    { name: "深化综合改革试点方案研究", department: "改革创新研究所", presenter: "陈三", description: "综合改革试点重点领域与实施路径" },
    { name: "公共服务均等化发展研究", department: "服务业与社会民生研究所", presenter: "褚四", description: "教育医疗等公共服务资源配置优化" },
    { name: "区域协调发展战略研究", department: "区域发展研究所", presenter: "卫五", description: "粤港澳大湾区协同发展策略" }
]

export async function POST() {
    try {
        const isAdmin = await isAdminAuthenticated()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 清空现有项目和评分
        await prisma.score.deleteMany()
        await prisma.project.deleteMany()

        // 重置评分状态
        await prisma.config.upsert({
            where: { key: 'scoring_state' },
            update: { value: 'CLOSED' },
            create: { key: 'scoring_state', value: 'CLOSED' }
        })

        // 清除当前项目
        await prisma.config.deleteMany({
            where: { key: 'current_project' }
        })

        // 创建模拟项目
        for (const project of MOCK_PROJECTS) {
            await prisma.project.create({ data: project })
        }

        return NextResponse.json({
            success: true,
            message: '模拟数据加载成功',
            projectsCreated: MOCK_PROJECTS.length
        })
    } catch (error) {
        console.error('Load mock data error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
