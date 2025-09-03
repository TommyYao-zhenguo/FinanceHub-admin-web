import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { TaxService, TaxUploadRecord } from "../services/taxService";

export default function TaxUploadView() {
  const [records, setRecords] = useState<TaxUploadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取上传记录
  const fetchUploadRecords = async () => {
    try {
      setLoading(true);
      const data = await TaxService.getUploadRecords(selectedPeriod);
      setRecords(data.records);
    } catch (error) {
      console.error("获取上传记录失败:", error);
      toast.error("获取上传记录失败");
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取记录
  useEffect(() => {
    fetchUploadRecords();
  }, [selectedPeriod]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter((file) => {
      // 检查文件类型
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (!validTypes.includes(file.type)) {
        toast.error(`文件 ${file.name} 格式不支持，请上传 Excel 或 CSV 文件`);
        return false;
      }

      // 检查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 大小超过 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);

    try {
      // 逐个上传文件
      for (const file of validFiles) {
        await TaxService.uploadTaxFile(file, selectedPeriod);
        toast.success(`文件 ${file.name} 上传成功`);
      }

      // 上传完成后刷新记录列表
      await fetchUploadRecords();
    } catch (error) {
      console.error("文件上传失败:", error);
      toast.error("文件上传失败");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  

  

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "1":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "0":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "1":
        return "有效";
      case "0":
        return "无效";
      default:
        return "未知";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Upload className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">税费上传</h1>
            <p className="text-gray-600">上传和管理税费相关文件</p>
          </div>
        </div>
      </div>

      {/* 文件上传区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">文件上传</h3>
          <p className="text-sm text-gray-600 mt-1">
            支持 Excel、CSV、PDF 格式，单个文件不超过 10MB
          </p>
        </div>

        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept=".xlsx,.xls,.csv,.pdf"
              disabled={loading}
            />

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {loading ? "上传中..." : "拖拽文件到此处或点击选择文件"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .xlsx, .xls, .csv, .pdf 格式
                </p>
              </div>

              {loading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full animate-pulse"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">已上传文件</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">期间:</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  税种名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    暂无上传记录
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.taxName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.period}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAmount(record.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.createTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className="text-sm text-gray-900">
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
