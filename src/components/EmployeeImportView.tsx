import React, { useState, useRef } from "react";
import {
  Upload,
  Users,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  EmployeeImportService,
  ImportResult,
} from "../services/employeeImportService";

export default function EmployeeImportView() {
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      await EmployeeImportService.downloadTemplate();
      toast.success("模板下载成功");
    } catch (error) {
      console.error("下载模板失败:", error);
      toast.error("下载模板失败");
    }
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 处理文件上传和导入
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // 检查文件类型
    const fileExtension = file.name.toLowerCase().split(".").pop();
    if (!["xlsx", "xls"].includes(fileExtension || "")) {
      toast.error("请上传Excel文件（.xlsx或.xls格式）");
      return;
    }

    try {
      setUploading(true);
      setImporting(true);
      setImportResult(null);
      setShowResult(false);

      const result = await EmployeeImportService.importEmployees(file);

      setImportResult(result);
      setShowResult(true);

      if (result.success) {
        toast.success(`员工导入成功！成功导入 ${result.successCount} 条记录`);
      } else {
        toast.error(
          `导入完成，但有部分失败。成功 ${result.successCount} 条，失败 ${result.failureCount} 条`
        );
      }
    } catch (error) {
      console.error("导入失败:", error);
      toast.error("员工导入失败，请检查文件格式和内容");
    } finally {
      setUploading(false);
      setImporting(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // 关闭结果弹窗
  const handleCloseResult = () => {
    setShowResult(false);
    setImportResult(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">员工录入</h1>
        </div>
        <p className="text-gray-600">
          通过Excel文件批量导入员工信息，包括基本信息、工资和社保公积金配置
        </p>
      </div>

      <div className="space-y-6">
        {/* 下载模板卡片 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  下载导入模板
                </h3>
                <p className="text-gray-600">
                  下载标准Excel模板，按照格式填写员工信息
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              下载模板
            </button>
          </div>
        </div>

        {/* 文件上传卡片 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            上传员工信息文件
          </h3>

          {/* 上传区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              uploading
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                )}
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading
                    ? "正在上传..."
                    : "拖拽Excel文件到此处，或点击选择文件"}
                </p>
                <p className="text-gray-500 mt-1">
                  支持 .xlsx 和 .xls 格式，文件大小不超过10MB
                </p>
              </div>

              {!uploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  选择文件
                </button>
              )}
            </div>
          </div>

          {/* 导入进度 */}
          {importing && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">
                  正在导入员工信息，请稍候...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 导入要求说明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="flex items-center text-lg font-semibold text-yellow-800 mb-3">
            <AlertCircle className="h-5 w-5 mr-2" />
            导入要求说明
          </h4>
          <div className="text-yellow-700 space-y-2">
            <p>
              <strong>必填字段：</strong>
              公司名称、公司统一信用代码、员工姓名、身份证号、入职时间、手机号、基本工资
            </p>
            <p>
              <strong>选填字段：</strong>是否缴纳社保、是否缴纳公积金、备注
            </p>
            <p>
              <strong>日期格式：</strong>入职时间请使用 YYYY-MM-DD
              格式，如：2024-01-15
            </p>
            <p>
              <strong>布尔值格式：</strong>是否缴纳社保/公积金请填写：是/否 或
              true/false 或 1/0
            </p>
            <p>
              <strong>注意事项：</strong>
              身份证号必须为18位有效身份证号，手机号必须为11位有效手机号
            </p>
          </div>
        </div>
      </div>

      {/* 导入结果弹窗 */}
      {showResult && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  导入结果
                </h3>
                <button
                  onClick={handleCloseResult}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {importResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {importResult.success
                        ? "导入成功！"
                        : "导入完成（部分失败）"}
                    </p>
                    <p className="text-gray-600">
                      共处理 {importResult.total} 条记录
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">成功导入：</span>
                    <span className="font-semibold text-green-600">
                      {importResult.successCount} 条
                    </span>
                  </div>
                  {importResult.failureCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">导入失败：</span>
                      <span className="font-semibold text-red-600">
                        {importResult.failureCount} 条
                      </span>
                    </div>
                  )}
                </div>

                {importResult.errorDetails &&
                  importResult.errorDetails.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">
                        错误详情：
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <ul className="text-sm text-red-700 space-y-1">
                          {importResult.errorDetails.map(
                            (error: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start space-x-1"
                              >
                                <span className="text-red-500">•</span>
                                <span>{error}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseResult}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
