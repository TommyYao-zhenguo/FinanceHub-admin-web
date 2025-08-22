import React, { useState, useRef } from "react";
import { Upload, FileText, Download, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TaxFile {
  id: number;
  fileName: string;
  fileSize: number;
  uploadTime: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  companyId: number;
  companyName: string;
  taxPeriod: string;
  remarks?: string;
}

export default function TaxUploadView() {
  const [files, setFiles] = useState<TaxFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setLoading(true);
    
    try {
      const file = fileList[0];
      
      // 验证文件类型
      const allowedTypes = ['.xlsx', '.xls', '.csv', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('只支持 Excel、CSV 或 PDF 文件格式');
        return;
      }
      
      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('文件大小不能超过 10MB');
        return;
      }
      
      // TODO: 实现文件上传API调用
      const formData = new FormData();
      formData.append('file', file);
      
      // 模拟上传成功
      const newFile: TaxFile = {
        id: Date.now(),
        fileName: file.name,
        fileSize: file.size,
        uploadTime: new Date().toISOString(),
        status: 'completed',
        companyId: 1,
        companyName: '示例公司',
        taxPeriod: new Date().toISOString().slice(0, 7),
        remarks: '上传成功'
      };
      
      setFiles(prev => [newFile, ...prev]);
      toast.success('文件上传成功');
      
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败，请重试');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (file: TaxFile) => {
    try {
      // TODO: 实现文件下载API调用
      console.log('下载文件:', file.fileName);
      toast.success('文件下载开始');
    } catch (error) {
      console.error('文件下载失败:', error);
      toast.error('文件下载失败，请重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    try {
      // TODO: 实现文件删除API调用
      setFiles(prev => prev.filter(file => file.id !== id));
      toast.success('文件删除成功');
    } catch (error) {
      console.error('文件删除失败:', error);
      toast.error('文件删除失败，请重试');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: TaxFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: TaxFile['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'processing':
        return '处理中';
      default:
        return '待处理';
    }
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
          <p className="text-sm text-gray-600 mt-1">支持 Excel、CSV、PDF 格式，单个文件不超过 10MB</p>
        </div>
        
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
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
                  {loading ? '上传中...' : '拖拽文件到此处或点击选择文件'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .xlsx, .xls, .csv, .pdf 格式
                </p>
              </div>
              
              {loading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">已上传文件</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文件名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  税费期间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文件大小
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  上传时间
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
              {files.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暂无上传文件
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.fileName}
                          </div>
                          {file.remarks && (
                            <div className="text-sm text-gray-500">
                              {file.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{file.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{file.taxPeriod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatFileSize(file.fileSize)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(file.uploadTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        <span className="text-sm text-gray-900">
                          {getStatusText(file.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="下载文件"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="删除文件"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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