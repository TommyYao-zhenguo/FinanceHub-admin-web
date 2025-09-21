# 员工录入功能开发文档

## 功能概述

在 admin 前端页面中新增了"员工录入"菜单项，支持通过 Excel 文件批量导入员工信息。

## 新增文件

### 1. 组件文件

- `/src/components/EmployeeImportView.tsx` - 员工录入主页面组件

### 2. 服务文件

- `/src/services/employeeImportService.ts` - 员工导入服务，处理文件上传和下载

## 修改文件

### 1. 侧边栏菜单

- `/src/components/Sidebar.tsx` - 添加"员工录入"菜单项到客户管理子菜单中

### 2. 路由配置

- `/src/App.tsx` - 添加员工录入页面的路由配置

## 功能特性

### 1. 下载模板功能

- 提供标准 Excel 模板下载
- 模板包含所有必要字段的示例格式

### 2. 文件上传功能

- 支持拖拽上传和点击选择文件
- 支持.xlsx 和.xls 格式
- 文件大小限制 10MB
- 实时上传进度显示

### 3. 数据验证

- 前端基础格式验证
- 后端完整业务逻辑验证
- 详细的错误提示

### 4. 导入结果展示

- 成功/失败统计
- 详细错误信息列表
- 用户友好的结果反馈

## 导入字段

### 必填字段

- 公司名称
- 公司统一信用代码（18 位）
- 员工姓名
- 身份证号（18 位）
- 入职时间（YYYY-MM-DD 格式）
- 手机号（11 位）
- 基本工资（数字，大于 0）

### 选填字段

- 是否缴纳社保（是/否 或 true/false 或 1/0）
- 是否缴纳公积金（是/否 或 true/false 或 1/0）
- 备注

## API 接口

### 1. 下载模板

```
GET /api/v1/employee/import/template
```

### 2. 批量导入员工

```
POST /api/v1/employee/import
Content-Type: multipart/form-data
Body: file (Excel文件)
```

响应格式：

```typescript
interface ImportResult {
  success: boolean;
  total: number;
  successCount: number;
  failureCount: number;
  errorDetails?: string[];
}
```

## 菜单权限

- 菜单项位于"客户管理"子菜单中
- 仅客服用户（roleCode: "CUSTOMER_SERVICE"）可见
- 位置：侧边栏 -> 客户管理 -> 员工录入

## 使用流程

1. 点击侧边栏"客户管理" -> "员工录入"
2. 下载 Excel 导入模板
3. 按模板格式填写员工信息
4. 上传填写好的 Excel 文件
5. 查看导入结果和错误详情

## 错误处理

### 前端验证

- 文件格式检查
- 文件大小限制
- 基本数据格式验证

### 后端验证

- 业务规则验证
- 数据完整性检查
- 重复数据检查

### 用户反馈

- Toast 消息提示
- 详细的错误列表
- 成功/失败统计

## 技术栈

- React + TypeScript
- Lucide React 图标
- React Hot Toast 消息提示
- Tailwind CSS 样式
- Vite 构建工具

## 注意事项

1. 确保后端 API 接口已实现
2. 需要配置正确的 API 基础 URL
3. 需要有效的认证 token
4. Excel 模板格式需要与后端解析逻辑匹配
