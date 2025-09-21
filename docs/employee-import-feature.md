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

- 后端生成 Excel 模板文件（含示例数据）
- 支持中文显示，可用 Excel 正常打开
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

### 4. 权限校验

- 参考税费上传的权限校验方式
- 验证每条记录的统一信用代码权限
- 无权限的记录会被拒绝并提示错误信息

### 5. 导入结果展示

- 成功/失败状态显示
- 详细错误信息提示
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
GET /api/v1/admin/employee/import/template
```

### 2. 批量导入员工

```
POST /api/v1/admin/employee/import
Content-Type: multipart/form-data
Body: file (Excel文件)
```

响应格式：

```typescript
interface ImportResult {
  success: boolean;
  message: string;
}
```

## 菜单权限

- 菜单项位于"客户管理"子菜单中
- 仅客服用户（roleCode: "CUSTOMER_SERVICE"）可见
- 位置：侧边栏 -> 客户管理 -> 员工录入

## 使用流程

1. 点击侧边栏"客户管理" -> "员工录入"
2. 点击"下载模板"按钮下载 Excel 模板文件
3. 用 Excel 打开模板，按格式填写员工信息
4. 保存为 Excel 格式上传
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
- 权限验证（统一信用代码权限检查）
- 公司存在性验证

### 用户反馈

- Toast 消息提示
- 详细的错误信息
- 成功状态显示

## 技术栈

- React + TypeScript
- Lucide React 图标
- React Hot Toast 消息提示
- Tailwind CSS 样式
- Vite 构建工具
- EasyExcel（后端 Excel 处理）

## 注意事项

1. 模板下载使用后端 API 生成真正的 Excel 文件
2. 导入功能需要后端 API 接口支持
3. 需要配置正确的 API 基础 URL
4. 需要有效的认证 token
5. 后端使用 EasyExcel 解析 Excel 文件
6. 权限校验参考税费上传实现方式
