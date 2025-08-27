import React, { useState, useEffect } from "react";
import { Building2, Search } from "lucide-react";
import { CompanyService } from "../utils/companyService";
import { Company } from "../types/company";

interface CompanyListStepProps {
  onCompanySelect: (companyNo: string, companyName: string) => void;
}

export default function CompanyListStep({
  onCompanySelect,
}: CompanyListStepProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    size: 12,
    total: 0,
    pages: 0,
  });

  // 加载公司列表
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        size: pagination.size,
        ...(searchKeyword && { keyword: searchKeyword }),
      };

      const response = await CompanyService.getCompanyList(params);
      setCompanies(response.records || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
        pages: response.pages || 0,
      });
    } catch {
      // 处理错误
    } finally {
      setLoading(false);
    }
  };

  // 搜索公司
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  // 监听分页和搜索变化
  useEffect(() => {
    loadCompanies();
  }, [pagination.current]);

  // 处理公司选择
  const handleCompanyClick = (company: Company) => {
    onCompanySelect(company.companyNo, company.companyName);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">选择服务公司</h2>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索公司名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md   focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none   focus:ring-blue-500 focus:ring-offset-2"
        >
          搜索
        </button>
      </div>

      {/* 公司表格 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    公司名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    公司编号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    税号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    状态
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr
                    key={company.companyNo}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.companyName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.companyNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.taxNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        正常
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleCompanyClick(company)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        选择
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      current: pagination.current - 1,
                    })
                  }
                  disabled={pagination.current <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      current: pagination.current + 1,
                    })
                  }
                  disabled={pagination.current >= pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第{" "}
                    <span className="font-medium">
                      {(pagination.current - 1) * pagination.size + 1}
                    </span>{" "}
                    到{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.current * pagination.size,
                        pagination.total
                      )}
                    </span>{" "}
                    条，共{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    家公司
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          current: pagination.current - 1,
                        })
                      }
                      disabled={pagination.current <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {pagination.current} / {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          current: pagination.current + 1,
                        })
                      }
                      disabled={pagination.current >= pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
