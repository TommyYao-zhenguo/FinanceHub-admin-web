import React, { useState, useEffect } from "react";
import { Building2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompanyService } from "../utils/companyService";
import { Company, CompanyQueryParams, CompanyListResponse } from "../types/company";
import toast from "react-hot-toast";

export default function CompanyHousingFundListView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<CompanyQueryParams>({
    current: 1,
    size: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchName, setSearchName] = useState("");
  
  const navigate = useNavigate();

  // 获取公司列表
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response: CompanyListResponse = await CompanyService.getCustomerServiceCompanyList(searchParams);
      setCompanies(response.records || []);
      setTotal(response.total || 0);
      setTotalPages(response.pages || 0);
    } catch (error) {
      console.error("获取公司列表失败:", error);
      toast.error("获取公司列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchCompanies();
  }, [searchParams]);

  // 搜索处理
  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      current: 1,
      companyName: searchName.trim() || undefined,
    });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchName("");
    setSearchParams({
      current: 1,
      size: 10,
    });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, current: page });
  };

  // 查看公积金明细
  const handleViewHousingFund = (company: Company) => {
    navigate(`/company-housing-fund-detail/${company.companyNo}`, {
      state: { companyName: company.companyName }
    });
  };

  // 格式化状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            正常
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            停用
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            未知
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">公司公积金明细管理</h2>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索公司名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>搜索</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 公司列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                公司信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                统一社会信用代码
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客服
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">加载中...</span>
                  </div>
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Building2 className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-500">暂无公司数据</span>
                  </div>
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.companyName}
                        </div>
                     
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.taxNumber || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {company.customerServiceName || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusDisplay(company.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.createTime).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewHousingFund(company)}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看公积金明细</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {!loading && companies.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            共 {total} 条记录，第 {searchParams.current} / {totalPages} 页
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(searchParams.current! - 1)}
              disabled={searchParams.current === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            
            {/* 页码显示 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, searchParams.current! - 2)) + i;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    searchParams.current === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(searchParams.current! + 1)}
              disabled={searchParams.current === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}