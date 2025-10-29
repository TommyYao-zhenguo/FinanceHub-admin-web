import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Receipt,
  FileUp,
  List,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { useAlert } from "../hooks/useAlert";
import * as XLSX from "xlsx";
import { InvoiceManagementService } from "../services/invoiceManagementService";
import { InvoiceReceiptList } from "./InvoiceReceiptList";
import { InvoiceIssueList } from "./InvoiceIssueList";

type InvoiceType = "issued" | "received";

interface ExcelValidationResult {
  isValid: boolean;
  errorMessage?: string;
  sheetNames?: string[];
  hasSummarySheet?: boolean;
}

const InvoiceManagementView: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedInvoiceType, setSelectedInvoiceType] =
    useState<InvoiceType>("issued");
  const [activeTab, setActiveTab] = useState<"upload" | "list">("upload");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useAlert();

  const invoiceTypes = [
    {
      value: "issued",
      label: "开具发票",
      icon: Receipt,
      description: "向客户开具的发票",
    },
    {
      value: "received",
      label: "取得发票",
      icon: FileUp,
      description: "从供应商取得的发票",
    },
  ];

  // 验证 Excel 文件格式
  const validateExcelFile = (file: File): Promise<ExcelValidationResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetNames = workbook.SheetNames;
          const hasMultipleSheets = sheetNames.length > 1;
          const hasSummarySheet = sheetNames.includes("信息汇总表");

          // 对于取得发票，如果只有一个工作表则直接解析
          // 如果有多个工作表，则必须包含"信息汇总表"
          if (
            selectedInvoiceType === "received" &&
            hasMultipleSheets &&
            !hasSummarySheet
          ) {
            resolve({
              isValid: false,
              errorMessage:
                '取得发票的 Excel 文件如果有多个工作表，必须包含名为"信息汇总表"的工作表',
              sheetNames,
              hasSummarySheet,
            });
            return;
          }
          resolve({
            isValid: true,
            sheetNames,
            hasSummarySheet,
          });
        } catch {
          resolve({
            isValid: false,
            errorMessage: "文件格式错误，无法解析 Excel 文件",
          });
        }
      };

      reader.onerror = () => {
        resolve({
          isValid: false,
          errorMessage: "文件读取失败",
        });
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // 清除选中的文件
  const handleClearFiles = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  // 删除单个文件
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 处理文件选择和验证
  const handleFileSelection = async (fileList: FileList) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const invalidFiles: { file: File; error: string }[] = [];

    // 验证每个文件
    for (const file of files) {
      const validation = await validateExcelFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          file,
          error: validation.errorMessage || "文件验证失败",
        });
      }
    }

    // 显示验证结果
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles
        .map(({ file, error }) => `${file.name}: ${error}`)
        .join("\n");
      showError(`有 ${invalidFiles.length} 个文件验证失败:\n${errorMessages}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      showSuccess(`已选择 ${validFiles.length} 个有效文件`);
    }
  };

  // 处理文件上传
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      showError("请先选择文件");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;

      for (const file of selectedFiles) {
        // 验证文件
        const validation = await validateExcelFile(file);
        if (!validation.isValid) {
          showError(`文件 ${file.name} 验证失败: ${validation.errorMessage}`);
          continue;
        }

        // 上传文件
        try {
          await InvoiceManagementService.uploadInvoiceFile({
            file,
            invoiceType: selectedInvoiceType,
          });
          completedFiles++;

          // 更新进度
          const progress = Math.round((completedFiles / totalFiles) * 100);
          setUploadProgress(progress);

          showSuccess(`文件 ${file.name} 上传成功`);
        } catch (error: unknown) {
          console.error("文件上传失败:", error);
          const errorMessage =
            error instanceof Error ? error.message : "上传失败";
          showError(`文件 ${file.name} 上传失败: ${errorMessage}`);
        }
      }

      // 上传完成后清空文件列表
      if (completedFiles > 0) {
        setSelectedFiles([]);
        showSuccess(`成功上传 ${completedFiles} 个文件`);
      }
    } catch (error: unknown) {
      console.error("批量上传失败:", error);
      showError("批量上传失败，请重试");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 处理拖拽上传
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
      handleFileSelection(fileList);
    }
  };

  // 处理点击选择文件
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      handleFileSelection(fileList);
    }
    // 重置文件输入框的值，确保下次选择相同文件时也能触发 onChange 事件
    e.target.value = "";
  };

  // 删除文件
  // const handleDeleteFile = (fileId: string) => {
  //     setFiles(prev => prev.filter(f => f.id !== fileId));
  //     showSuccess('文件已删除');
  // };

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      await InvoiceManagementService.downloadInvoiceTemplate(
        selectedInvoiceType
      );
      showSuccess("模板下载成功");
    } catch (error) {
      console.error("模板下载失败:", error);
      showError(
        `模板下载失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  // 获取当前类型的文件
  // const getCurrentTypeFiles = () => {
  //     return files.filter(file => file.invoiceType === selectedInvoiceType);
  // };

  // 获取发票类型信息
  const getCurrentInvoiceTypeInfo = () => {
    return invoiceTypes.find((type) => type.value === selectedInvoiceType);
  };

  // 格式化文件大小
  // const formatFileSize = (bytes: number) => {
  //     if (bytes === 0) return '0 Bytes';
  //     const k = 1024;
  //     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //     const i = Math.floor(Math.log(bytes) / Math.log(k));
  //     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  // 获取状态图标
  // const getStatusIcon = (status: InvoiceFile['status']) => {
  //     switch (status) {
  //         case 'uploading':
  //             return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
  //         case 'processing':
  //             return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>;
  //         case 'success':
  //             return <CheckCircle className="h-4 w-4 text-green-600" />;
  //         case 'error':
  //             return <XCircle className="h-4 w-4 text-red-600" />;
  //         default:
  //             return <AlertCircle className="h-4 w-4 text-gray-600" />;
  //     }
  // };

  // 获取状态文本
  // const getStatusText = (file: InvoiceFile) => {
  //     switch (file.status) {
  //         case 'uploading':
  //             return '上传中...';
  //         case 'processing':
  //             return '处理中...';
  //         case 'success':
  //             return `处理完成 (${file.processedCount}/${file.totalCount})`;
  //         case 'error':
  //             return '处理失败';
  //         default:
  //             return '未知状态';
  //     }
  // };

  // const currentFiles = getCurrentTypeFiles();
  const currentTypeInfo = getCurrentInvoiceTypeInfo();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          发票管理
        </h1>
        <p className="mt-2 text-gray-600">上传和管理客户发票数据</p>
      </div>

      {/* 标签页导航 */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>文件上传</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>发票明细</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      {activeTab === "upload" && (
        <>
          {/* 发票类型选择器 */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                选择发票类型
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoiceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() =>
                        setSelectedInvoiceType(type.value as InvoiceType)
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedInvoiceType === type.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`h-6 w-6 ${
                            selectedInvoiceType === type.value
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        />
                        <div>
                          <div
                            className={`font-medium ${
                              selectedInvoiceType === type.value
                                ? "text-blue-900"
                                : "text-gray-900"
                            }`}
                          >
                            {type.label}
                          </div>
                          <div
                            className={`text-sm ${
                              selectedInvoiceType === type.value
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          >
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 上传区域 */}
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentTypeInfo?.label} - 文件上传
              </h3>
              <p className="text-gray-600">{currentTypeInfo?.description}</p>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFiles.length === 0 ? (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    拖拽文件到此处或点击选择文件
                  </h3>
                  <p className="text-gray-500 mb-4">
                    支持 Excel 文件 (.xlsx, .xls)，最大 100MB
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      选择文件
                    </button>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>下载模板</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      已选择 {selectedFiles.length} 个文件
                    </h3>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileUp className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isUploading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">上传中...</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isUploading ? "上传中..." : "提交"}</span>
                    </button>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        </>
      )}

      {activeTab === "list" && selectedInvoiceType === "received" && (
        <InvoiceReceiptList isActive={activeTab === "list"} />
      )}

      {activeTab === "list" && selectedInvoiceType === "issued" && (
        <InvoiceIssueList isActive={activeTab === "list"} />
      )}
    </div>
  );
};

export default InvoiceManagementView;
