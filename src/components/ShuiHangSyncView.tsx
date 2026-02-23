import React, { useState, useEffect } from "react";
import { Key, Send, RefreshCw } from "lucide-react";
import { Select } from "antd";
import { CompanyService } from "../utils/companyService";
import { ShuiHangService } from "../utils/shuiHangService";
import { Company } from "../types/company";
import toast from "react-hot-toast";

export default function ShuiHangSyncView() {
  const [companies, setCompanies] = useState<Company[]>([]);
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

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "SYNC_ALL" | "SYNC_HISTORY" | null
  >(null);

  const openConfirmModal = (action: "SYNC_ALL" | "SYNC_HISTORY") => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    if (pendingAction === "SYNC_ALL") {
      executeSyncAll();
    } else if (pendingAction === "SYNC_HISTORY") {
      executeSync();
    }
    setPendingAction(null);
  };

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
      // Fetch all active companies with spid
      const validCompanies = await CompanyService.getActiveWithSpid();
      setCompanies(validCompanies);
    } catch (error) {
      toast.error("加载公司列表失败");
      console.error(error);
    }
  };

  const handleCompanyChange = (value: string) => {
    const companyNo = value;
    const company = companies.find((c) => c.companyNo === companyNo) || null;
    setSelectedCompany(company);
    // Reset states
    setVerifyCode("");
  };

  const handleSyncAll = async () => {
    openConfirmModal("SYNC_ALL");
  };

  const executeSyncAll = async () => {
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
    openConfirmModal("SYNC_HISTORY");
  };

  const executeSync = async () => {
    if (!selectedCompany?.spid) return;
    try {
      setSyncLoading(true);
      // Convert yyyy-MM-dd to yyyyMMdd
      const start = startDate.replace(/-/g, "");
      const end = endDate.replace(/-/g, "");

      await ShuiHangService.sync(selectedCompany!.spid, start, end);
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
            <div>
              <label
                htmlFor="historyCompany"
                className="block text-sm font-medium text-gray-700"
              >
                选择公司
              </label>
              <Select
                id="historyCompany"
                className="w-full"
                showSearch
                placeholder="请选择公司..."
                value={selectedCompany?.companyNo}
                onChange={handleCompanyChange}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={companies.map((company) => ({
                  value: company.companyNo,
                  label: company.companyName,
                }))}
              />
            </div>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[480px] transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">操作确认</h3>
            <p className="text-gray-600 mb-8 text-lg">
              请确认已发送验证码（只需发送一次即可）
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-5 py-2.5 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowConfirmModal(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="px-5 py-2.5 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                onClick={handleConfirm}
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
