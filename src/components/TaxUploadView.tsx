import React, { useState, useRef, useEffect } from "react";
import { Upload, Download } from "lucide-react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import { TaxService, TaxUploadRecord } from "../services/taxService";

export default function TaxUploadView() {
  const [records, setRecords] = useState<TaxUploadRecord[]>([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const data = await TaxService.getUploadRecords(
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
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取记录
  useEffect(() => {
    fetchUploadRecords();
  }, [selectedPeriod]);

  // 下载Excel模板
  // 所属期	统一信用代码	客户名称	税种	金额
  //   2025-09	123	测试的公司的的0902	增值税	0
  const downloadExcelTemplate = () => {
    // 创建Excel模板数据
    const templateData = [
      ["所属期", "统一社会信用代码", "客户名称", "税种", "金额"],
      [
        "2025-09",
        "91110000000000000X",
        "测试的公司的的0902",
        "增值税",
        "1000.00",
      ],
      [
        "2025-09",
        "91110000000000000X",
        "测试的公司的的0902",
        "企业所得税",
        "123.56",
      ],
      [
        "2025-09",
        "91110000000000000X",
        "测试的公司的的0902",
        "个人所得税",
        "225.74",
      ],
    ];

    // 创建工作簿
    const ws = utils.aoa_to_sheet(templateData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "税费上传模板");

    // 设置列宽
    ws["!cols"] = [
      { wch: 15 }, // 所属期
      { wch: 25 }, // 统一社会信用代码
      { wch: 20 }, // 客户名称
      { wch: 15 }, // 税种
      { wch: 15 }, // 金额
    ];

    // 下载文件
    writeFile(wb, "税费上传模板.xlsx");
    toast.success("Excel模板下载成功");
  };

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
          <h3 className="text-lg font-semibold text-gray-900">税费明细列表</h3>
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
                  公司名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  税种名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期间
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
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
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
