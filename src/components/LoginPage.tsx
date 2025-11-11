import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  Cpu,
  Globe,
  Database,
  Info,
  AlertCircle,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { httpClient } from "../utils/http";
import { API_ENDPOINTS, SA_TOKEN_CONFIG } from "../config/api";
import { useAdminUserContext } from "../contexts/AdminUserContext";
import toast, { Toaster } from "react-hot-toast";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface LoginResponse {
  token: string;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; opacity: number }>
  >([]);

  const { fetchUserInfo } = useAdminUserContext();

  // 生成动态粒子效果
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 5000);
    return () => clearInterval(interval);
  }, []);

  // 用户名验证函数
  const validateUsername = (username: string) => {
    if (!username) {
      setUsernameError("用户名不能为空");
      return false;
    }

    // 如果长度小于 6 则标记错误
    if (username.length < 6) {
      setUsernameError("用户名长度不能小于 6 位");
      return false;
    }

    // 如果长度超过 30 则标记错误
    if (username.length > 30) {
      setUsernameError("用户名长度不能超过 30 位");
      return false;
    }

    // 验证用户名
    const isValidUsername = (username: string) => {
      // 字母/数字/下划线
      const pattern = /^[a-zA-Z0-9_]+$/;
      return pattern.test(username);
    };
    if (!isValidUsername(username)) {
      setUsernameError("用户名只能包含字母、数字和下划线");
      return false;
    }

    setUsernameError("");
    return true;
  };

  // 密码验证函数
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("密码不能为空");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("密码长度至少6位");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("请填写用户名和密码");
      return;
    }

    setIsLoading(true);
    try {
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.SYS_USER.LOGIN,
        { username: username.trim(), password: password.trim() },
        {
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      );

      if (response) {
        // 使用sa-token配置的token名称存储
        localStorage.setItem(SA_TOKEN_CONFIG.tokenName, response.token);

        // 登录成功后立即获取用户信息

        await fetchUserInfo();

        toast.success("登录成功！");
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        toast.error("登录失败，请稍后重试");
      }
    } catch (error) {
      toast.error("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const digitalFeatures = [
    { icon: Shield, title: "安全加密", desc: "银行级安全保障" },
    { icon: Zap, title: "实时处理", desc: "毫秒级响应速度" },
    { icon: TrendingUp, title: "智能分析", desc: "AI驱动财务洞察" },
    { icon: BarChart3, title: "可视化报表", desc: "直观数据展示" },
    { icon: Cpu, title: "云端计算", desc: "强大算力支持" },
    { icon: Globe, title: "全球服务", desc: "7x24小时在线" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      <Toaster position="top-right" />
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
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
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
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>
      {/* 动态光束效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>
      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>
      {/* 主要内容 */}
      <div className="relative z-10 flex min-h-screen">
        {/* 左侧 - 品牌展示区 */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md text-center space-y-8">
            {/* Logo区域 */}
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                <Database className="w-10 h-10 text-white" />
                <img
                  src="/qiyuan-logo.jpg"
                  className="w-22 h-20 text-white rounded-full"
                  alt="数字化财务中心"
                />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                金财云数字化财务管理后台
              </h1>
              <p className="text-xl text-cyan-200">
                金财云智能财务管理 • 数字化转型
              </p>
            </div>

            {/* 特性展示 */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              {digitalFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300 group"
                  >
                    <Icon className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 group-hover:text-cyan-300 transition-all" />
                    <h3 className="font-semibold text-sm text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-cyan-200/80">{feature.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* 数字化元素 */}
            <div className="flex justify-center space-x-8 mt-8 text-cyan-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">99.9%</div>
                <div className="text-xs">系统可用性</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">10000+</div>
                <div className="text-xs">企业用户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">24/7</div>
                <div className="text-xs">技术支持</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 登录表单区 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* 移动端Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center shadow-2xl shadow-cyan-500/25 mb-4">
                <img
                  src="/qiyuan-logo.jpg"
                  className="w-16 h-14 text-white rounded-full"
                  alt="数字化管理后台"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                金财云数字化财务管理后台
              </h1>
              <p className="text-cyan-200">金财云智能财务管理平台</p>
            </div>

            {/* 登录卡片 */}
            <div className="bg-gray-900/30 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">欢迎登录</h2>
                <p className="text-cyan-200">请输入您的账户信息</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 用户名输入 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">
                    用户名
                    <Info
                      className="inline w-4 h-4 ml-1 text-cyan-400 cursor-help"
                      data-tooltip-id="username-tooltip"
                    />
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                    <input
                      type="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (usernameError) validateUsername(e.target.value);
                      }}
                      onBlur={() => validateUsername(username)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900/20 border rounded-xl text-white placeholder-cyan-300/60 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                        usernameError
                          ? "border-red-500/50 focus:ring-red-400 focus:border-red-400"
                          : "border-cyan-500/30 focus:ring-cyan-400 focus:border-cyan-400"
                      }`}
                      placeholder="请输入用户名"
                      required
                    />
                    {usernameError && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle
                          className="w-5 h-5 text-red-400"
                          data-tooltip-id="username-error-tooltip"
                        />
                      </div>
                    )}
                  </div>
                  {usernameError && (
                    <p className="text-red-400 text-sm mt-1">{usernameError}</p>
                  )}
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyan-200">
                    密码
                    <Info
                      className="inline w-4 h-4 ml-1 text-cyan-400 cursor-help"
                      data-tooltip-id="password-tooltip"
                    />
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                      }}
                      onBlur={() => validatePassword(password)}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-900/20 border rounded-xl text-white placeholder-cyan-300/60 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                        passwordError
                          ? "border-red-500/50 focus:ring-red-400 focus:border-red-400"
                          : "border-cyan-500/30 focus:ring-cyan-400 focus:border-cyan-400"
                      }`}
                      placeholder="请输入密码"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      {passwordError && (
                        <AlertCircle
                          className="w-5 h-5 text-red-400"
                          data-tooltip-id="password-error-tooltip"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        data-tooltip-id="password-visibility-tooltip"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                  )}
                </div>

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={isLoading || !!usernameError || !!passwordError}
                  className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25"
                  data-tooltip-id="login-button-tooltip"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>登录中...</span>
                    </>
                  ) : (
                    <>
                      <span>立即登录</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 版权信息 */}
            <div className="text-center mt-8 text-cyan-300 text-sm">
              <p>© 2025 金财云数字化财务中心. 保留所有权利.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Tooltips */}
      <Tooltip
        id="username-tooltip"
        place="top"
        content="请输入您的用户名"
        style={{
          backgroundColor: "rgba(6, 182, 212, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="password-tooltip"
        place="top"
        content="密码长度至少6位，建议包含字母和数字"
        style={{
          backgroundColor: "rgba(6, 182, 212, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="email-error-tooltip"
        place="top"
        content={usernameError}
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="password-error-tooltip"
        place="top"
        content={passwordError}
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="password-visibility-tooltip"
        place="top"
        content={showPassword ? "隐藏密码" : "显示密码"}
        style={{
          backgroundColor: "rgba(6, 182, 212, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="remember-tooltip"
        place="top"
        content="勾选后下次访问将自动登录（建议仅在个人设备上使用）"
        style={{
          backgroundColor: "rgba(6, 182, 212, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="forgot-password-tooltip"
        place="top"
        content="点击找回密码，我们将发送重置链接到您的邮箱"
        style={{
          backgroundColor: "rgba(6, 182, 212, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      <Tooltip
        id="login-button-tooltip"
        place="top"
        content={
          isLoading
            ? "正在验证登录信息..."
            : usernameError || passwordError
            ? "请先修正表单错误"
            : "点击登录到财务管理系统"
        }
        style={{
          backgroundColor:
            isLoading || usernameError || passwordError
              ? "rgba(239, 68, 68, 0.9)"
              : "rgba(6, 182, 212, 0.9)",
          color: "white",
          borderRadius: "8px",
          fontSize: "12px",
          padding: "8px 12px",
        }}
      />
      {/* CSS动画 */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}
