# Go-Admin 前端（admin）项目文档

本目录提供供大语言模型（LLM）理解本项目代码库的说明文档。阅读顺序建议：

| 文档 | 内容 |
| --- | --- |
| [`01-project-overview.md`](./01-project-overview.md) | 项目概览、技术栈、目录结构、运行方式、核心架构（入口/路由/Redux/请求/布局/国际化/权限） |
| [`02-views-and-apis.md`](./02-views-and-apis.md) | 全部页面（views）清单、全部 API 模块清单与接口约定 |
| [`03-dev-guide.md`](./03-dev-guide.md) | 开发约定与新增一个 CRUD 模块的步骤指南 |
| [`04-code-review.md`](./04-code-review.md) | 代码审核报告（阻断/高危/中危/低危问题清单与修复优先级） |

## 一句话定位

这是一个 **Go-Admin 后台管理系统的前端工程**（`React 18 + TypeScript + Vite 6 + Ant Design 5 + ProComponents`）。它是后端 Go 管理平台的前端管理界面：支持用户/角色/菜单/部门/字典等系统管理，App 端用户管理，以及内容/消息/文件等插件域管理。路由由后端菜单动态下发，前端按约定源码路径动态加载页面。

关键技术结论（详见各文档）：

- **构建**：Vite（`vite.config.ts`），入口 `index.html` → `src/main.tsx`，全局样式 less，路径别名 `@ → src`。
- **路由**：`react-router-dom` 的 `HashRouter`；静态路由 + 后端下发的动态路由（`import.meta.glob` 按 `/src/views` + `element` 路径懒加载）。
- **状态**：原生 Redux（非 RTK）+ `redux-thunk`/`redux-promise` 中间件 + `immer` + `redux-persist`（key=`redux-state`，存 localStorage）；模块：`global`、`menu`、`tabs`、`auth`、`breadcrumb`。
- **请求**：封装 axios（`src/utils/request`），统一拦截器、Token（Bearer）、NProgress、全屏 loading、401/403 处理、请求取消。
- **权限**：按钮级权限用 `HocAuth`（`AuthButton`）；页面/菜单权限由后端 `menu-role` 接口下发的路由列表决定。
- **国际化**：i18next（zh/en）+ antd locale，语言存于 redux `global.language`。
- **布局**：`Sider(菜单) + Header(面包屑/语言/全屏/头像) + Tabs(标签页) + KeepAlive(内容) + Footer`。

> 注意：`src/redux/index.ts` 中导出的 `useDispatch`/`useSelector` 是**存根实现**（并非真正可用的 hook），组件实际通过 `react-redux` 的 `connect` 或直接 `store.getState()`/`store.dispatch()` 存取状态。