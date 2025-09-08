import React, { useState, useEffect } from "react";
import { ArrowLeft, Building2, User, Download, Search } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { HousingFundService, HousingFundEmployee } from "../services/housingFundService";

// 公积金明细数据类型
interface HousingFundDetail {
  id: string;
  employeeName: string;
  employeeNo: string;
  idCard: string;
  month: string;
  personalAmount: number;
  companyAmount: number;
  totalAmount: number;
  personalRatio: number;
  companyRatio: number;
  baseSalary: number;
  status: string;
  createTime: string;
}

// 查询参数类型
interface QueryParams {
  current: number;
  size: number;
  companyNo?: string;
  employeeName?: string;
  month?: string;
}



export default function CompanyHousingFundDetailView() {
  const [details, setDetails] = useState<HousingFundDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    current: 1,
    size: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  
  const navigate = useNavigate();
  const { companyNo } = useParams<{ companyNo: string }>();
  const location = useLocation();
  const companyName = location.state?.companyName || "未知公司";

  // 获取公积金明细列表
  const fetchHousingFundDetails = async () => {
    if (!companyNo) return;
    
    try {
      setLoading(true);
      
      // 调用真实的API接口
      const response = await HousingFundService.getHousingFundListWithPage(
        companyNo,
        queryParams.month || "2024-01", // 默认期间
        queryParams.employeeName || "",
        queryParams.current,
        queryParams.size
      );
      
      // 将API返回的数据转换为组件需要的格式
       const transformedRecords: HousingFundDetail[] = response.records.map((item: HousingFundEmployee) => ({
        id: item.id,
        employeeName: item.employeeName,
        employeeNo: item.employeeNo,
        idCard: item.employeeId, // 使用employeeId作为身份证号
        month: item.period,
        personalAmount: item.personalAmount,
        companyAmount: item.companyAmount,
        totalAmount: item.totalAmount,
        personalRatio: item.personalRate,
        companyRatio: item.companyRate,
        baseSalary: item.fundBase, // 使用fundBase作为基数工资
        status: item.status,
        createTime: item.createTime
      }));
      
      setDetails(transformedRecords);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("获取公积金明细失败:", error);
      toast.error("获取公积金明细失败");
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchHousingFundDetails();
  }, [queryParams, companyNo]);

  // 搜索处理
  const handleSearch = () => {
    setQueryParams({
      ...queryParams,
      current: 1,
      employeeName: searchName.trim() || undefined,
      month: searchMonth.trim() || undefined,
    });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchName("");
    setSearchMonth("");
    setQueryParams({
      current: 1,
      size: 10,
      companyNo,
    });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, current: page });
  };

  // 返回公司列表
  const handleBack = () => {
    navigate(-1);
  };

  // 格式化状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            已缴费
          </span>
        );
      case "UNPAID":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            未缴费
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            待处理
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

  // 格式化金额显示
  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
            <p className="text-sm text-gray-500">公积金明细 ({companyNo})</p>
          </div>
        </div>
        
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索员工姓名"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <input
              type="month"
              placeholder="选择月份"
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSearch}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
      </div>



      {/* 明细列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                员工信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                缴费月份
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                基数工资
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                个人缴费
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                公司缴费
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                合计金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">加载中...</span>
                  </div>
                </td>
              </tr>
            ) : details.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <User className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-500">暂无公积金明细数据</span>
                  </div>
                </td>
              </tr>
            ) : (
              details.map((detail) => (
                <tr key={detail.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {detail.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {detail.employeeNo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{detail.month}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatAmount(detail.baseSalary)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(detail.personalAmount)}
                      <span className="text-xs text-gray-500 ml-1">({detail.personalRatio}%)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(detail.companyAmount)}
                      <span className="text-xs text-gray-500 ml-1">({detail.companyRatio}%)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAmount(detail.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusDisplay(detail.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {!loading && details.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            共 {total} 条记录，第 {queryParams.current} / {totalPages} 页
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(queryParams.current - 1)}
              disabled={queryParams.current === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            
            {/* 页码显示 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, queryParams.current - 2)) + i;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    queryParams.current === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(queryParams.current + 1)}
              disabled={queryParams.current === totalPages}
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