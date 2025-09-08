# 开票额度管理功能实现

## 修改时间
2024-12-19

## 修改文件
- `src/components/client/InvoiceQuotaManagementView.tsx` (新建)
- `src/App.tsx`
- `src/components/Sidebar.tsx`

## 功能描述
在管理后台的客户管理菜单下新增"开票额度"管理功能，用于配置选择的某个公司的当月最高可开票额度。

## 主要功能

### 1. 开票额度管理页面
- **页面位置**: 客户管理 > 开票额度管理
- **权限控制**: 仅SUPER_ADMIN用户可访问
- **主要功能**:
  - 查看公司开票额度列表
  - 按公司名称、年份、月份筛选
  - 设置/编辑公司月度开票额度
  - 显示额度使用情况和使用率

### 2. 数据结构
```typescript
interface InvoiceQuota {
  id?: number;
  companyId: string;        // 公司ID
  companyName: string;      // 公司名称
  year: number;             // 年份
  month: number;            // 月份
  maxAmount: number;        // 最大开票额度
  usedAmount: number;       // 已用额度
  remainingAmount: number;  // 剩余额度
  createTime?: string;
  updateTime?: string;
}
```

### 3. 界面特性
- **搜索筛选**: 支持按公司名称、年份、月份筛选
- **额度显示**: 以货币格式显示金额，支持千分位分隔
- **使用率指示**: 
  - 绿色: 使用率 < 70%
  - 黄色: 70% ≤ 使用率 < 90%
  - 红色: 使用率 ≥ 90%
- **表单验证**: 完整的表单验证和错误提示

### 4. 业务逻辑
- **权限控制**: 只有SUPER_ADMIN用户可以访问此功能
- **唯一性约束**: 每个公司每月只能有一个开票额度配置
- **编辑限制**: 编辑时公司、年份、月份不可修改
- **金额验证**: 最大开票额度必须大于0

## 技术实现

### 1. 路由配置
- 路由路径: `/client/invoice-quota-management`
- 菜单ID: `invoice-quota-management`
- 组件: `InvoiceQuotaManagementView`

### 2. 菜单集成
- 位置: 系统管理子菜单
- 图标: Receipt (收据图标)
- 权限: hasCompanyManagementAccess() (SUPER_ADMIN)

### 3. 组件特性
- 响应式设计，支持移动端
- 模态框表单，用户体验友好
- 加载状态和错误处理
- TypeScript类型安全

### 4. 样式设计
- 主题色: 紫色 (purple-600)
- 统一的表格和表单样式
- 清晰的视觉层次
- 直观的状态指示

## 用户操作流程

### 设置开票额度
1. 进入"客户管理" > "开票额度管理"
2. 点击"设置额度"按钮
3. 选择公司、年份、月份
4. 输入最大开票额度
5. 点击"创建"保存

### 编辑开票额度
1. 在列表中找到要编辑的记录
2. 点击"编辑"按钮
3. 修改最大开票额度（公司、年月不可修改）
4. 点击"更新"保存

### 查询筛选
1. 使用顶部搜索栏
2. 输入公司名称（支持模糊搜索）
3. 选择年份和月份
4. 点击"搜索"或"重置"

## 后续开发

### API接口（待实现）
- `GET /api/invoice-quota/list` - 获取开票额度列表
- `POST /api/invoice-quota` - 创建开票额度
- `PUT /api/invoice-quota/{id}` - 更新开票额度
- `DELETE /api/invoice-quota/{id}` - 删除开票额度

### 数据库表设计（建议）
```sql
CREATE TABLE invoice_quota (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id VARCHAR(50) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  used_amount DECIMAL(15,2) DEFAULT 0,
  remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (max_amount - used_amount),
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_company_year_month (company_id, year, month)
);
```

## 注意事项
1. 当前使用模拟数据，需要后端API支持
2. 已用额度需要与实际开票系统集成
3. 权限控制需要与后端保持一致
4. 建议添加操作日志记录
5. 考虑添加批量导入/导出功能