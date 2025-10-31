import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Receipt,
  FileUp,
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

  // 删除单个文件
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 处理文件选择和验证
  const handleFileSelection = async (fileList: FileList) => {
    const files = Array.from(fileList);
    const MAX_FILES = 50;
    
    // 检查文件数量限制
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > MAX_FILES) {
      const remainingSlots = MAX_FILES - selectedFiles.length;
      showError(`最多只能选择 ${MAX_FILES} 个文件，当前已选择 ${selectedFiles.length} 个，还可以选择 ${remainingSlots} 个，但您尝试新增 ${files.length} 个文件`);
      return;
    }

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
      // 合并新文件到已选择的文件列表
      const newSelectedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newSelectedFiles);
      showSuccess(`已选择 ${validFiles.length} 个有效文件，总计 ${newSelectedFiles.length} 个文件`);
    }
  };

  // 处理文件上传
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      showError("请先选择文件");
      return;
    }

    setIsUploading(true);

    try {
      // 验证所有文件
      const validFiles: File[] = [];
      const invalidFiles: { file: File; error: string }[] = [];

      for (const file of selectedFiles) {
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

      // 如果有有效文件，一次性上传所有文件
      if (validFiles.length > 0) {
        try {
          await InvoiceManagementService.uploadInvoiceFile({
            files: validFiles,
            invoiceType: selectedInvoiceType,
          });

          showSuccess(`成功上传 ${validFiles.length} 个文件`);
          setSelectedFiles([]);
        } catch (error: unknown) {
          console.error("批量上传失败:", error);
          const errorMessage =
            error instanceof Error ? error.message : "上传失败";
          showError(`批量上传失败: ${errorMessage}`);
        }
      }
    } catch (error: unknown) {
      console.error("文件验证失败:", error);
      showError("文件验证失败，请重试");
    } finally {
      setIsUploading(false);
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
                支持 Excel 文件 (.xlsx, .xls)，最大 100MB，最多可选择 50 个文件
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
                  已选择 {selectedFiles.length} 个文件 (最多 50 个，还可选择 {50 - selectedFiles.length} 个)
                </h3>
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
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
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
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 50}
                  className={`px-6 py-2 border rounded-lg transition-colors flex items-center space-x-2 ${
                    selectedFiles.length >= 50
                      ? "border-gray-300 text-gray-400 cursor-not-allowed"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>
                    {selectedFiles.length >= 50 ? "已达上限" : "继续选择文件"}
                  </span>
                </button>
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

      {/* 发票明细列表 */}
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentTypeInfo?.label} - 发票明细
          </h3>
          <p className="text-gray-600">查看和管理已上传的发票数据</p>
        </div>
        {selectedInvoiceType === "received" && <InvoiceReceiptList />}
        {selectedInvoiceType === "issued" && <InvoiceIssueList />}
      </div>
    </div>
  );
};

export default InvoiceManagementView;
