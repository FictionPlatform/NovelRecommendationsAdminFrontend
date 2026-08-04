# 03 — 开发指南

面向在本项目上做开发的约定与步骤。

## 1. 代码规范

- 代码风格由 Prettier 强制：`printWidth 130`、`useTabs`、`semi`、`singleQuote: false`、`trailingComma: none`。
- ESLint 规则宽松（大量 `@typescript-eslint/*` 与 react-hooks 检查被关闭），提交前走 lint-staged。
- 全局样式变量：`src/styles/var.less`（`@primary-color`），已通过 vite `additionalData` 注入所有 less，可直接使用。
- 路径别名：`@/` = `src/`。
- 所有业务接口统一走 `src/api/` 下的模块封装，页面组件内不直接 import axios。

## 2. 新增一个 CRUD 模块（后端已具备接口时）

以模块 `foo`（域 `admin/sys`、权限前缀 `admin:foo`）为例：

### 步骤 1：API 层

新建 `src/api/admin/sys/sys-foo/index.ts`：

```ts
import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface FooModel {
  id?: number;
  name?: string;
  createdAt?: Date;
}

// 标准 6 件套 + 导出
export const getFooPageApi = (params: ReqPage) =>
  request.get<ResPage<FooModel>>(`/admin-api/v1/admin/sys/sys-foo`, { ...params, pageIndex: params?.current });
export const getFooApi = (id: number) => request.get<FooModel>(`/admin-api/v1/admin/sys/sys-foo/` + id);
export const addFooApi = (data: FooModel) => request.post(`/admin-api/v1/admin/sys/sys-foo`, data);
export const updateFooApi = (id: number, data: FooModel) => request.put(`/admin-api/v1/admin/sys/sys-foo/` + id, data);
export const delFooApi = (ids: number[]) => request.delete(`/admin-api/v1/admin/sys/sys-foo`, { ids });
export const exportFooApi = (query: object) => request.download(`/admin-api/v1/admin/sys/sys-foo/export`, query);
```

### 步骤 2：页面

新建 `src/views/admin/sys/sys-foo/index.tsx`：

```tsx
import { ProTable } from "@ant-design/pro-components";
import { formatDataForProTable } from "@/utils";
import { getFooPageApi } from "@/api/admin/sys/sys-foo";

const SysFoo = () => (
  <ProTable
    rowKey="id"
    pagination={{ pageSize: 10 }}
    request={async params => {
      const { data } = await getFooPageApi(params);
      return formatDataForProTable(data);
    }}
    columns={[{ title: "名称", dataIndex: "name" }]}
  />
);
export default SysFoo;
```

- 需要增删改时：目录下建 `components/FormModal.tsx`（antd Form + Modal 模式，参考 `sys-user/components/FormModal.tsx`），操作按钮用 `AuthButton` 包权限：
  ```tsx
  <AuthButton permission={["admin:foo:add"]}>新增</AuthButton>
  ```

### 步骤 3：路由与菜单

路由**不是**在前端注册的：需要后端在菜单表新增该页面（`path` 对应页面路由如 `/admin/sys/sys-foo`，`element` 填 `/admin/sys/sys-foo/index` 即去掉 `src/views` 前缀与 `.tsx` 后缀的路径），并为角色授权后即可访问（`element` 需与 `src/views` 下文件路径严格一致，动态路由依赖 `import.meta.glob` 匹配）。

## 3. 常用模式速查

| 场景 | 做法 |
| --- | --- |
| 分页表格 | `ProTable` + `formatDataForProTable`；分页参数用 `ReqPage`（`current/pageSize`） |
| 树形/无分页表格 | `ProTable` + `formatDataListForProTable(data)` |
| 下拉字典 | `getDictsApi(dictType)` → `getDictOptions` 构建 `Map` |
| 部门树 | `getDeptTreeApi()` |
| 角色授权 | `roleMenuTreeselectApi(roleId)` / `roleDeptTreeselectApi(roleId)` |
| 文件上传 | antd `Upload`（或 `rc-upload` request option）→ 对应 upload 接口 |
| 导出 Excel | `exportXxxApi(params)` → `saveExcelBlob("文件名", blob)` |
| 下载 zip | 对应 download 接口 → `saveZipBlob("文件名", blob)` |
| 异步开关 | `LoadingSwitch`，`onChange` 返回 Promise |
| 长文本输入 | `Input.TextArea`（内容类表单字段，无富文本控件） |
| 按钮权限 | `AuthButton permission={[...]}`（通配 `*:*:*`） |
| 状态读取 | 组件内 `connect`，或 `store.getState()`（redux/index 的 hooks 为占位不可用） |
| 发起请求带 loading | 第三个参数 `{ loading: true }`；不要 loading 时 `{ headers: { noLoading: true } }` |
| 全屏图标 | `Icon name="HomeOutlined"` 或 `IconFont` |
| 图表 | `useEcharts(options)` + `src/utils/echarts` 按需引入 |

## 4. 常见坑点（维护者须知）

1. `src/redux/index.ts` 的 `useDispatch`/`useSelector` 是**假实现**，新增代码不要用它们。
2. 动态路由的 `element` 值必须与 `src/views/` 下文件路径一致（`/admin/sys/sys-foo/index` ↔ `src/views/admin/sys/sys-foo/index.tsx`），否则页面 404。
3. `BreadcrumbNav` 只在 `themeConfig.breadcrumb === false` 时渲染（逻辑与直觉相反），默认隐藏面包屑。
4. `tabs` 模块的 `tabsActive` 未使用；关闭标签页逻辑以 `pathname` 为准。
5. 登录密码、改密等接口要求前端 `md5` 后再传（见 `sys-user` API）。
6. 分页接口后端参数名是 `pageIndex`（非 `current`），每个分页 API 都做了 `{...params, pageIndex: params?.current}` 映射，新增接口别漏。
7. `delXxxApi` 传参为 `{ ids: number[] }`（axios delete 的第二个参数作为 body 配置）。
8. 上传接口用 FormData；头像 URL 为相对路径时 `setUserInfo` 会自动拼接 `VITE_API_URL`。
9. 接口返回 `code: 401` 时拦截器会直接清 token 并跳转登录页，无需页面自行处理。
10. 生产构建使用 esbuild minify 且 `VITE_DROP_CONSOLE=true` 会移除 `debugger`（console 需配合 terser 才能全删，当前配置 console 保留）。
