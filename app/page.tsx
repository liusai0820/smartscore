import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen ink-gradient cloud-pattern relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角装饰圆 */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#c53d43]/10 to-transparent blur-3xl" />
        {/* 右下角装饰圆 */}
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#d4a853]/10 to-transparent blur-3xl" />
        {/* 中央光晕 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#c53d43]/5 to-transparent blur-3xl" />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-8 animate-fade-in-up">

          {/* Logo与标题区 */}
          <div className="space-y-4">
            {/* 装饰性印章图标 */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl vermilion-gradient shadow-lg shadow-[#c53d43]/30 mb-4">
              <svg className="w-10 h-10 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* 主标题 - 使用宋体 */}
            <h1 className="text-5xl md:text-6xl font-black text-[var(--color-text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              智<span className="text-[#c53d43]">评</span>
            </h1>

            {/* 英文副标题 */}
            <p className="text-lg text-[#d4a853] font-medium tracking-widest uppercase">
              SmartScore
            </p>

            {/* 描述文字 */}
            <p className="text-[var(--color-text-secondary)] text-lg mt-4 leading-relaxed">
              专业的内部项目评分系统
              <br />
              <span className="text-sm">公正 · 高效 · 透明</span>
            </p>
          </div>

          {/* 操作按钮区 */}
          <div className="space-y-4 pt-8">
            {/* 评审员入口 - 主按钮 */}
            <Link
              href="/login"
              className="group relative block w-full overflow-hidden"
            >
              <div className="relative flex items-center justify-center gap-3 py-5 px-8 rounded-xl vermilion-gradient text-[var(--color-text-primary)] font-bold text-lg shadow-lg shadow-[#c53d43]/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#c53d43]/40 group-hover:scale-[1.02]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>评审员登录</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            {/* 实时展示入口 */}
            <Link
              href="/display"
              className="group relative block w-full overflow-hidden"
            >
              <div className="relative flex items-center justify-center gap-3 py-5 px-8 rounded-xl bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] text-[var(--color-text-primary)] font-bold text-lg transition-all duration-300 hover:border-[#d4a853] hover:bg-[var(--color-ink-medium)] group-hover:scale-[1.02]">
                <svg className="w-6 h-6 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>实时大屏</span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-2 h-2 rounded-full bg-[#7ec699] animate-pulse" />
                  <span className="text-xs text-[#7ec699] font-normal">LIVE</span>
                </div>
              </div>
            </Link>

            {/* 管理入口 - 次要按钮 */}
            <Link
              href="/admin"
              className="group inline-flex items-center justify-center gap-2 py-3 px-6 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-sm font-medium transition-colors duration-300 mt-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>管理控制台</span>
            </Link>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[var(--color-text-muted)] text-xs">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-[var(--color-ink-soft)] to-transparent" />
          <span>公平评审 · 数据驱动</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-[var(--color-ink-soft)] to-transparent" />
        </div>
      </div>
    </div>
  )
}
