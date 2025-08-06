import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Globe,
  Database,
  Users,
  Receipt,
  Building,
  CreditCard,
  PieChart,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';

interface HomePageProps {
  onLoginClick: () => void;
}

export default function HomePage({ onLoginClick }: HomePageProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);

  // 生成动态粒子效果
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 8000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      icon: Users,
      title: '人员工资管理',
      description: '智能化员工薪酬管理，自动计算个税、社保，一键发放工资',
      features: ['工资计算', '个税申报', '薪酬分析']
    },
    {
      icon: Receipt,
      title: '税费管理',
      description: '全面的税务管理服务，包括增值税、企业所得税等各类税费',
      features: ['税费计算', '申报缴纳', '税务筹划']
    },
    {
      icon: Shield,
      title: '社会保险',
      description: '企业社保缴费管理，五险一金自动计算和申报',
      features: ['社保缴费', '公积金管理', '政策更新']
    },
    {
      icon: Building,
      title: '住房公积金',
      description: '住房公积金缴存管理，基数调整和账户查询',
      features: ['缴存管理', '基数调整', '账户查询']
    },
    {
      icon: CreditCard,
      title: '发票管理',
      description: '电子发票开具和管理，支持多种发票类型',
      features: ['发票开具', '发票查验', '电子归档']
    },
    {
      icon: PieChart,
      title: '财务报表',
      description: '自动生成各类财务报表，实时掌握企业财务状况',
      features: ['报表生成', '数据分析', '趋势预测']
    }
  ];

  const advantages = [
    {
      icon: Zap,
      title: '高效便捷',
      description: '一站式财务管理，大幅提升工作效率'
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '银行级安全保障，数据加密存储'
    },
    {
      icon: Cpu,
      title: '智能化',
      description: 'AI驱动的智能财务分析和决策支持'
    },
    {
      icon: Globe,
      title: '云端服务',
      description: '7×24小时云端服务，随时随地访问'
    }
  ];

  const testimonials = [
    {
      name: '张总',
      company: '北京科技有限公司',
      content: '使用启苑数字化财务中心后，我们的财务工作效率提升了300%，强烈推荐！',
      rating: 5
    },
    {
      name: '李经理',
      company: '上海贸易有限公司',
      content: '专业的服务团队，完善的功能模块，是我们企业数字化转型的最佳选择。',
      rating: 5
    },
    {
      name: '王总',
      company: '深圳制造有限公司',
      content: '系统稳定可靠，操作简单易用，大大减轻了我们财务人员的工作负担。',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* 动态背景粒子 */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-cyan-400 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* 科技网格线 */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* 动态光束效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              启苑数字化财务中心
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="#services"
              className="text-cyan-200 hover:text-cyan-400 transition-colors"
            >
              服务介绍
            </a>
            <a
              href="#advantages"
              className="text-cyan-200 hover:text-cyan-400 transition-colors"
            >
              产品优势
            </a>
            <a
              href="#testimonials"
              className="text-cyan-200 hover:text-cyan-400 transition-colors"
            >
              客户评价
            </a>
            <a
              href="#contact"
              className="text-cyan-200 hover:text-cyan-400 transition-colors"
            >
              联系我们
            </a>
            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              立即登录
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-20 pt-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/25 mb-8">
                <Database className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  启苑数字化财务中心
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-cyan-200 mb-8 max-w-3xl mx-auto">
                专业的企业财务数字化解决方案，让财务管理更智能、更高效、更安全
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onLoginClick}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
                >
                  <span>开始使用</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-cyan-500/30 text-cyan-400 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-cyan-500/10 transition-all duration-200">
                  了解更多
                </button>
              </div>
            </div>

            {/* 数据统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                  10000+
                </div>
                <div className="text-cyan-200">企业用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  99.9%
                </div>
                <div className="text-cyan-200">系统可用性</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                  24/7
                </div>
                <div className="text-cyan-200">技术支持</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
                  5年+
                </div>
                <div className="text-cyan-200">行业经验</div>
              </div>
            </div>
          </div>
        </section>

        {/* 服务介绍 */}
        <section
          id="services"
          className="px-6 py-20 bg-gray-900/30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                核心服务
              </h2>
              <p className="text-xl text-cyan-200 max-w-2xl mx-auto">
                全方位的财务数字化服务，覆盖企业财务管理的各个环节
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {service.title}
                    </h3>
                    <p className="text-cyan-200 mb-6">{service.description}</p>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-cyan-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 产品优势 */}
        <section id="advantages" className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                产品优势
              </h2>
              <p className="text-xl text-cyan-200 max-w-2xl mx-auto">
                为什么选择启苑数字化财务中心？
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/25">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {advantage.title}
                    </h3>
                    <p className="text-cyan-200">{advantage.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 客户评价 */}
        <section
          id="testimonials"
          className="px-6 py-20 bg-gray-900/30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                客户评价
              </h2>
              <p className="text-xl text-cyan-200 max-w-2xl mx-auto">
                听听我们客户的真实反馈
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-cyan-200 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-cyan-300">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 联系我们 */}
        <section id="contact" className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                联系我们
              </h2>
              <p className="text-xl text-cyan-200 max-w-2xl mx-auto">
                准备开始您的数字化财务管理之旅？
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">客服热线</div>
                    <div className="text-cyan-200">13331818028</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">邮箱地址</div>
                    <div className="text-cyan-200">
                      yaozhenguo5800@hotmail.com
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">公司地址</div>
                    <div className="text-cyan-200">
                      上海市闵行区虹梅南路4999号18幢
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">服务时间</div>
                    <div className="text-cyan-200">7×24小时在线服务</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">立即体验</h3>
                <p className="text-cyan-200 mb-8">
                  点击下方按钮，立即登录体验我们的数字化财务管理系统
                </p>
                <button
                  onClick={onLoginClick}
                  className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
                >
                  <span>立即登录</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="px-6 py-12 bg-gray-900/50 backdrop-blur-sm border-t border-cyan-500/20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                启苑数字化财务中心
              </span>
            </div>
            <p className="text-cyan-300 mb-4">
              © 2024 启苑数字化财务中心. 保留所有权利.
            </p>
            <p className="text-sm text-cyan-400">专业 • 安全 • 高效 • 智能</p>
          </div>
        </footer>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}