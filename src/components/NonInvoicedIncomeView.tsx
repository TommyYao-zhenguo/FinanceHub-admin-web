import React, { useState, useRef, useEffect } from "react";
import { Upload, FileUp, X, Send, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";
import {
  NonInvoicedIncomeService,
  NonInvoicedIncomeUploadRecord,
} from "../services/nonInvoicedIncomeService";

export default function NonInvoicedIncomeView() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const [records, setRecords] = useState<NonInvoicedIncomeUploadRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });

  const fetchRecords = async () => {
    try {
      setRecordLoading(true);
      const res = await NonInvoicedIncomeService.listUploadRecords(
        pagination.current,
        pagination.size
      );
      setRecords(res.records || []);
      setPagination((prev) => ({
        ...prev,
        total: res.total || 0,
        pages: res.pages || 0,
      }));
    } catch (e) {
      toast.error("获取上传记录失败");
    } finally {
      setRecordLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.size]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => {
      const combined = [...prev, ...files];
      // 去重：按文件名去重，保留后选的
      const map = new Map<string, File>();
      for (const f of combined) {
        map.set(f.name, f);
      }
      return Array.from(map.values());
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("请先选择文件（支持多选）");
      return;
    }

    // 逐个校验扩展名
    const validFiles: File[] = [];
    const invalidFiles: { file: File; error: string }[] = [];
    for (const f of selectedFiles) {
      const name = f.name.toLowerCase();
      if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
        invalidFiles.push({ file: f, error: "文件格式错误" });
      } else {
        validFiles.push(f);
      }
    }

    if (invalidFiles.length > 0) {
      const msg = invalidFiles
        .map(({ file, error }) => `${file.name}: ${error}`)
        .join("\n");
      toast.error(`有 ${invalidFiles.length} 个文件格式不正确:\n${msg}`);
    }

    if (validFiles.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      const res = await NonInvoicedIncomeService.uploadExcel(validFiles);
      if (res?.success) {
        toast.success(`成功上传 ${validFiles.length} 个文件`);
        setSelectedFiles([]);
        fetchRecords();
      } else {
        toast.error(res?.message || "上传失败");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 下载模板交由服务层实现
  const handleDownloadTemplate = () => {
    NonInvoicedIncomeService.downloadTemplate();
  };

  // 拖拽交互保持与发票管理一致
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fileList = e.dataTransfer.files;
    if (fileList.length > 0) {
      handleFileChange({
        target: { files: fileList },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* 头部与说明与发票管理保持一致 */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">文件上传</h3>
            <p className="text-sm text-gray-600 mt-1">
              支持 Excel（.xlsx/.xls）格式，单次可选择多个文件
            </p>
          </div>
        </div>

        {/* 拖拽上传区域 */}
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFiles.length === 0 ? (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">拖拽文件到此处，或点击下方按钮选择文件</p>
                <p className="text-sm text-gray-500">仅支持 Excel（.xlsx/.xls）</p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-medium text-gray-900 mb-2">已选择文件</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 操作按钮区与发票管理一致 */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={handleDownloadTemplate}
              className="px-6 py-2 border rounded-lg transition-colors flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>下载模板</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 border rounded-lg transition-colors flex items-center space-x-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4" />
              <span>继续选择文件</span>
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>上传中...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>提交</span>
                </>
              )}
            </button>
          </div>

          {/* 隐藏的文件选择 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="px-6 pb-6 text-xs text-gray-500">
          上传后系统将校验统一信用代码权限，仅保存有权限的记录。
        </div>
      </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">上传记录</h3>
          <p className="text-sm text-gray-600 mt-1">展示近期上传记录，支持分页</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={pagination.size}
            onChange={(e) =>
              setPagination((prev) => ({ ...prev, size: Number(e.target.value), current: 1 }))
            }
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10/页</option>
            <option value={20}>20/页</option>
            <option value={50}>50/页</option>
          </select>
          <button
            onClick={fetchRecords}
            className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            刷新
          </button>
        </div>
      </div>

      <div className="p-6">
        {recordLoading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>加载中...</span>
          </div>
        )}

        {!recordLoading && records.length === 0 && (
          <div className="text-sm text-gray-500">暂无上传记录</div>
        )}

        {!recordLoading && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">统一信用代码</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传时间</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属期间</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">处理状态</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">错误信息</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((rec, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{rec.creditCode || "-"}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{rec.createTime || "-"}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{rec.period || "-"}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{rec.success ? "成功" : "失败"}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{rec.errorMessage || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          第 {pagination.current} / {Math.max(pagination.pages, 1)} 页，共 {pagination.total} 条
        </div>
        <div className="space-x-2">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, current: Math.max(prev.current - 1, 1) }))
            }
            disabled={pagination.current <= 1}
            className="px-3 py-1 border rounded text-sm text-gray-700 disabled:text-gray-400 disabled:border-gray-300 hover:bg-gray-50"
          >
            上一页
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current: Math.min(prev.current + 1, Math.max(prev.pages, 1)),
              }))
            }
            disabled={pagination.current >= Math.max(pagination.pages, 1)}
            className="px-3 py-1 border rounded text-sm text-gray-700 disabled:text-gray-400 disabled:border-gray-300 hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
