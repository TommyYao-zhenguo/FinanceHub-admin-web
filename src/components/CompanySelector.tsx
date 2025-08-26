import React, { useState, useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { CompanyService } from "../utils/companyService";
import { Company } from "../types/company";
import { useAdminUserContext } from "../contexts/AdminUserContext";

interface CompanySelectorProps {
  value?: string;
  onChange: (companyNo: string, companyName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CompanySelector({
  value,
  onChange,
  placeholder = "请选择公司",
  disabled = false,
  className = "",
}: CompanySelectorProps) {
  const { userInfo } = useAdminUserContext();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // 加载公司列表
  const loadCompanies = async () => {
    try {
      setLoading(true);
      let response;

      // 根据用户角色调用不同的API
      if (userInfo?.roleCode === "CUSTOMER_SERVICE") {
        response = await CompanyService.getCustomerServiceCompanyList({
          current: 1,
          size: 100, // 获取所有公司
          status: "ACTIVE",
        });
      } else {
        response = await CompanyService.getCompanyList({
          current: 1,
          size: 100, // 获取所有公司
          status: "ACTIVE",
        });
      }

      console.log("companyService.getCompanyList:", response);

      setCompanies(response.records || []);
    } catch (error) {
      console.error("加载公司列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载公司列表
  useEffect(() => {
    loadCompanies();
  }, []);

  // 当value变化时，更新选中的公司
  useEffect(() => {
    if (value && companies.length > 0) {
      const company = companies.find((c) => c.companyNo === value);
      setSelectedCompany(company || null);
    } else {
      setSelectedCompany(null);
    }
  }, [value, companies]);

  // 选择公司
  const handleSelectCompany = (company: Company) => {
    console.log("Selected company:", company);
    setSelectedCompany(company);
    onChange(company.companyNo, company.companyName);
    setIsOpen(false);
  };

  // 清除选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompany(null);
    onChange("", "");
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors
          ${
            disabled
              ? "bg-gray-100 border-gray-300 cursor-not-allowed"
              : "bg-white border-gray-300 hover:border-gray-400"
          }
          ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
            <span
              className={`truncate ${
                selectedCompany ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {selectedCompany ? selectedCompany.companyName : placeholder}
            </span>
          </div>
          <div className="flex items-center">
            {selectedCompany && !disabled && (
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded mr-1"
                onClick={handleClear}
              >
                <span className="text-gray-400 hover:text-gray-600">×</span>
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* 下拉选项 */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              加载中...
            </div>
          ) : companies.length === 0 ? (
            <div className="px-3 py-2 text-center text-gray-500">
              暂无公司数据
            </div>
          ) : (
            companies.map((company) => (
              <div
                key={company.companyNo}
                className={`
                  px-3 py-2 cursor-pointer transition-colors
                  ${
                    selectedCompany?.companyNo === company.companyNo
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50"
                  }
                `}
                onClick={() => handleSelectCompany(company)}
              >
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="truncate">{company.companyName}</span>
                  {company.status === "INACTIVE" && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      未激活
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 点击外部关闭下拉框 */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
