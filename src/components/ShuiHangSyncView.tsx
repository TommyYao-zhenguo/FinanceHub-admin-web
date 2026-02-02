import React, { useState, useEffect } from "react";
import { Building2, Key, Send, RefreshCw } from "lucide-react";
import { CompanyService } from "../utils/companyService";
import { ShuiHangService } from "../utils/shuiHangService";
import { Company } from "../types/company";
import toast from "react-hot-toast";

export default function ShuiHangSyncView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Login State
  const [loginLoading, setLoginLoading] = useState(false);

  // Verify State
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Sync State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncAllLoading, setSyncAllLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
    // Initialize dates to today
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // yyyy-MM-dd
    setStartDate(formattedDate);
    setEndDate(formattedDate);
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      // Fetch all active companies
      const response = await CompanyService.getCompanyList({
        current: 1,
        size: 1000,
        status: "ACTIVE",
      });
      // Filter companies that have spid
      const validCompanies = (response.records || []).filter((c) => c.spid);
      setCompanies(validCompanies);
    } catch (error) {
      toast.error("加载公司列表失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyNo = e.target.value;
    const company = companies.find((c) => c.companyNo === companyNo) || null;
    setSelectedCompany(company);
    // Reset states
    setVerifyCode("");
  };

  const handleSyncAll = async () => {
    try {
      setSyncAllLoading(true);
      await ShuiHangService.syncAll();
      toast.success("同步任务启动成功，将在后台执行");
    } catch (error) {
      console.error(error);
      toast.error("触发同步任务失败");
    } finally {
      setSyncAllLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedCompany?.spid) return;
    try {
      setLoginLoading(true);
      await ShuiHangService.login(selectedCompany.spid);
      toast.success("登录请求已发送");
    } catch (error) {
      console.error(error);
      toast.error("登录请求失败");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedCompany?.spid || !verifyCode) return;
    try {
      setVerifyLoading(true);
      await ShuiHangService.verify(selectedCompany.spid, verifyCode);
      toast.success("验证码已发送");
    } catch (error) {
      console.error(error);
      toast.error("发送验证码失败");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedCompany?.spid || !startDate || !endDate) return;
    try {
      setSyncLoading(true);
      // Convert yyyy-MM-dd to yyyyMMdd
      const start = startDate.replace(/-/g, "");
      const end = endDate.replace(/-/g, "");

      await ShuiHangService.sync(selectedCompany.spid, start, end);
      toast.success("发票同步请求已发送");
    } catch (error) {
      console.error(error);
      toast.error("同步请求失败");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <RefreshCw className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">税务局开票数据同步</h1>
      </div>

      {/* Company Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">选择公司</h2>
        </div>
        <div className="max-w-md">
          {loading ? (
            <p className="text-gray-500">加载公司列表中...</p>
          ) : (
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              value={selectedCompany?.companyNo || ""}
              onChange={handleCompanyChange}
            >
              <option value="">请选择公司...</option>
              {companies.map((company) => (
                <option key={company.companyNo} value={company.companyNo}>
                  {company.companyName}
                </option>
              ))}
            </select>
          )}
          <p className="mt-2 text-sm text-gray-500">
            仅显示已配置 SPID 的公司 (共 {companies.length} 家)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Step 1: Login */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Key className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">1. 登录税务局</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              点击按钮向税务局发送登录请求，获取短信验证码。
            </p>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loginLoading || !selectedCompany}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loginLoading ? "登录中..." : "登录获取验证码"}
            </button>
          </div>
        </div>

        {/* Step 2: Verify Code */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Send className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">2. 发送验证码</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="verifyCode"
                className="block text-sm font-medium text-gray-700"
              >
                短信验证码
              </label>
              <input
                type="text"
                id="verifyCode"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入验证码"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                disabled={!selectedCompany}
              />
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifyLoading || !verifyCode || !selectedCompany}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {verifyLoading ? "发送中..." : "确认发送"}
            </button>
          </div>
        </div>

        {/* Step 3: Sync All */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <RefreshCw className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">
              3. 一键同步所有
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              触发系统后台定时任务，自动扫描并同步所有需要更新的公司数据。
            </p>
            <div className="pt-8">
              {" "}
              {/* Spacer to align button at bottom if needed, or just standard spacing */}
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncAllLoading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {syncAllLoading ? "任务触发中..." : "一键同步所有"}
              </button>
            </div>
          </div>
        </div>

        {/* Step 4: Sync History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <RefreshCw className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">
              4. 同步历史数据
            </h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  开始日期
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!selectedCompany}
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  结束日期
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!selectedCompany}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSync}
              disabled={
                syncLoading || !startDate || !endDate || !selectedCompany
              }
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {syncLoading ? "同步中..." : "开始同步"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
