import React, { useState, useEffect } from "react";
import { Shield, Search, Eye, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompanyService } from "../utils/companyService";
import { Company, CompanyQueryParams, CompanyListResponse } from "../types/company";
import toast from "react-hot-toast";

export default function CompanySocialInsuranceListView() {
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
    setSearchParams({
      ...searchParams,
      current: page,
    });
  };

  // 查看社保明细
  const handleViewDetail = (company: Company) => {
    navigate(`/social-insurance-detail/${company.companyNo}`, {
      state: { companyName: company.companyName }
    });
  };

  // 生成分页按钮
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const currentPage = searchParams.current || 1;
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 上一页
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
        >
          上一页
        </button>
      );
    }

    // 页码
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            i === currentPage
              ? "bg-orange-50 border-orange-500 text-orange-600"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // 下一页
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
        >
          下一页
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          显示第 {(currentPage - 1) * (searchParams.size || 10) + 1} 到{" "}
          {Math.min(currentPage * (searchParams.size || 10), total)} 条，共 {total} 条记录
        </div>
        <div className="flex">{pages}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">公司社保明细</h1>
            <p className="text-gray-600">查看各公司的社保缴费明细信息</p>
          </div>
        </div>
      </div>

      {/* 搜索区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索公司名称..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 公司列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">公司列表</h3>
          <p className="text-sm text-gray-600 mt-1">共 {total} 家公司</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">暂无公司数据</p>
          </div>
        ) : (
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
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
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
                 
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.taxNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {company.status === "ACTIVE" ? "正常" : "停用"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(company)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>查看明细</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 分页 */}
        {!loading && companies.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            {renderPagination()}
          </div>
        )}
      </div>


    </div>
  );
}