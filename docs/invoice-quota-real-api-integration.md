# 开票额度管理 - 真实API接口集成

## 修改概述
将开票额度管理页面的模拟数据替换为真实的后端API接口数据，实现公司表和发票额度表的关联查询功能。

## 后端修改

### 1. 数据库查询层 (InvoiceQuotaMapper.java)
- **新增方法**: `selectAllCompaniesWithQuota`
- **功能**: 实现公司表作为左表的左连接查询
- **SQL逻辑**: 
  - 左连接 `t_company` 和 `t_invoice_quota` 表
  - 支持按公司名称模糊搜索
  - 支持分页查询
  - 按公司编号排序

### 2. 实体类扩展 (InvoiceQuotaE.java)
- **新增字段**: `companyName`
- **注解**: `@TableField(exist = false)` 标记为非数据库字段
- **用途**: 用于存储查询结果中的公司名称

### 3. 请求参数扩展 (InvoiceQuotaQueryRequest.java)
- **新增字段**: `companyName`
- **功能**: 支持按公司名称进行模糊搜索
- **注释**: "公司名称（模糊搜索）"

### 4. 服务层扩展 (InvoiceQuotaService.java)
- **新增方法**: `getAllCompaniesWithQuotaPage`
- **功能**: 调用Mapper层方法获取公司和额度关联数据
- **新增方法**: `convertToResponseForAllCompanies`
- **功能**: 转换查询结果为响应格式

### 5. API接口层 (AdminInvoiceQuotaResource.java)
- **新增接口**: `/api/v1/admin/invoice-quota/all-companies`
- **请求方式**: GET
- **参数**: current, size, companyName
- **功能**: 提供公司和额度关联查询的REST API

## 前端修改

### 1. API配置 (api.ts)
- **新增端点**: `ALL_COMPANIES: "/api/v1/admin/invoice-quota/all-companies"`
- **用途**: 配置新的API接口路径

### 2. 服务层扩展 (invoiceQuotaService.ts)
- **新增接口**: `CompanyQuotaQueryParams`
- **参数**: current, size, companyName
- **新增方法**: `getAllCompaniesWithQuota`
- **功能**: 调用后端API获取公司和额度关联数据

### 3. 组件逻辑修改 (InvoiceQuotaManagementView.tsx)
- **导入服务**: 引入 `InvoiceQuotaService` 和 `CompanyQuotaQueryParams`
- **替换模拟数据**: 将 `loadQuotas` 方法中的模拟数据替换为真实API调用
- **数据转换**: 将后端返回的数据格式转换为前端组件所需格式
- **日期解析**: 解析后端返回的 `statsDate` (YYYY-MM格式) 为年月字段

## 技术特性

### 1. 左连接查询
- **设计原因**: 公司表作为左表，确保所有公司都能显示，即使没有对应的开票额度记录
- **查询逻辑**: 使用 `LEFT JOIN` 连接公司表和发票额度表
- **数据完整性**: 保证公司信息的完整展示

### 2. 数据转换
- **后端到前端**: 将后端的 `companyNo`、`statsDate`、`maxAmount` 等字段转换为前端所需格式
- **日期处理**: 将 `YYYY-MM` 格式的统计日期解析为年份和月份
- **默认值处理**: 为缺失的数据提供合理的默认值

### 3. 搜索功能
- **公司名称搜索**: 支持按公司名称进行模糊搜索
- **年月筛选**: 支持按年份和月份进行精确筛选
- **分页支持**: 支持大数据量的分页查询

## 部署状态
- **后端服务**: 已启动，运行在 http://localhost:38080
- **前端服务**: 已启动，运行在 http://localhost:5174
- **API接口**: 已部署并可正常访问
- **数据源**: 已从模拟数据切换为真实数据库数据

## 注意事项
1. 后端暂未提供已使用额度字段，前端暂时设置为0
2. 剩余额度暂时等于最大额度
3. 需要确保数据库中有相应的公司和开票额度测试数据
4. API接口支持跨域访问，适配前后端分离架构

## 测试建议
1. 验证公司列表是否正确显示
2. 测试按公司名称搜索功能
3. 验证按年月筛选功能
4. 检查分页功能是否正常
5. 确认数据格式转换是否正确