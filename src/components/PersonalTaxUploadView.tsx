import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  PersonalTaxService,
  PersonalTaxUploadRecord,
} from "../services/personalTaxService";

export default function PersonalTaxUploadView() {
  const [records, setRecords] = useState<PersonalTaxUploadRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取上传记录
  const fetchUploadRecords = async (page: number = 1) => {
    try {
      const data = await PersonalTaxService.getUploadRecords(
        selectedPeriod,
        page,
        pagination.size
      );
      setRecords(data.records);
      setPagination({
        current: data.current,
        size: data.size,
        total: data.total,
        pages: data.pages,
      });
    } catch (error) {
      console.error("获取上传记录失败:", error);
      toast.error("获取上传记录失败");
    }
  };

  // 页面加载时获取记录
  useEffect(() => {
    fetchUploadRecords();
  }, [selectedPeriod]);

  // 下载Excel模板
  // 所属期	统一信用代码	客户名称	税种	金额
  //   2025-09	123	测试的公司的的0902	个人所得税	0
  const downloadExcelTemplate = () => {
    // 创建Excel模板数据
    const templateData = [
      [
        "所属期",
        "员工姓名",
        "员工身份证号",
        "公司名称",
        "统一社会信用代码",
        "金额",
      ],
      [
        "2025-09",
        "张三",
        "44030119900101001X",
        "测试的公司的的0902",
        "91110000000000000X",
        "1000.00",
      ],
      [
        "2025-09",
        "李四",
        "54030119900101001X",
        "测试的公司的的0902",
        "91110000000000000X",
        "1000.00",
      ],
      [
        "2025-09",
        "王五",
        "64030119900101001X",
        "测试的公司的的0902",
        "91110000000000000X",
        "225.74",
      ],
    ];

    // 创建工作簿
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "个税上传模板");

    // 设置列宽
    ws["!cols"] = [
      { wch: 15 }, // 所属期
      { wch: 15 }, // 员工姓名
      { wch: 20 }, // 员工身份证号
      { wch: 40 }, // 公司名称
      { wch: 25 }, // 统一社会信用代码
      { wch: 15 }, // 金额
    ];

    // 下载文件
    XLSX.writeFile(wb, "个税上传模板.xlsx");
    toast.success("Excel模板下载成功");
  };

  // 处理拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 处理文件拖拽放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 处理文件选择
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // 处理文件上传
  const handleFiles = async (files: FileList) => {
    const file = files[0];

    // 验证文件类型
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("不支持的文件格式，请上传 Excel、CSV 或 PDF 文件");
      return;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error("文件大小不能超过 10MB");
      return;
    }

    try {
      setUploading(true);
      const response = await PersonalTaxService.uploadPersonalTaxFile(
        file,
        selectedPeriod
      );

      if (response.success) {
        toast.success(response.message || "文件上传成功");
        // 重新获取记录列表
        await fetchUploadRecords();
      } else {
        toast.error(response.message || "文件上传失败");
      }
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("文件上传失败，请重试");
    } finally {
      setUploading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    fetchUploadRecords(page);
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
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">个税上传</h1>
            <p className="text-gray-600">上传和管理个人所得税相关文件</p>
          </div>
        </div>
      </div>

      {/* 文件上传区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">文件上传</h3>
            <p className="text-sm text-gray-600 mt-1">
              支持 Excel、CSV、PDF 格式，单个文件不超过 10MB
            </p>
          </div>
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>下载Excel模板</span>
          </button>
        </div>

        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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
              disabled={uploading}
            />

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading ? "上传中..." : "拖拽文件到此处或点击选择文件"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .xlsx, .xls, .csv, .pdf 格式
                </p>
              </div>

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full animate-pulse"
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
          <h3 className="text-lg font-semibold text-gray-900">个税明细列表</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">期间:</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  员工姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  员工身份证号
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  统一社会信用代码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所属期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无上传记录
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr
                    key={`${record.companyNo}-${record.taxType}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.companyName}
                      </div>
                    </td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控件 */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              共 {pagination.total} 条记录，第 {pagination.current} /{" "}
              {pagination.pages} 页
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
