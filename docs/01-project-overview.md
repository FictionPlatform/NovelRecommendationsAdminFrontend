# 01 — 项目概览与技术架构

## 1. 项目简介

- **名称**：Go-Admin（`package.json` 中 name 为 `react`，版本 `0.0.1`）。
- **定位**：后台管理系统前端（SPA），配合 Go 后端（后端接口前缀均为 `/admin-api/v1/...`）。
- **入口**：`index.html` → `src/main.tsx`。
- **路由模式**：`HashRouter`（URL 形如 `/#/home`）。

## 2. 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | React 18（`createRoot` + StrictMode）、React Router 7 |
| 构建 | Vite 6、TypeScript 5、`@vitejs/plugin-react`、`vite-plugin-html`（注入标题）、`vite-plugin-compression`（gzip） |
| UI | Ant Design 5、`@ant-design/pro-components`（ProTable/ProCard）、`antd-img-crop`、`driver.js`、`react-syntax-highlighter`、`react-transition-group` |
| 状态 | Redux（legacy `createStore`）、`redux-thunk`、`redux-promise`、`redux-persist`、`immer` |
| 请求 | axios |
| 图表 | echarts（按需引入，见 `src/utils/echarts`）、`echarts-liquidfill` |
| 国际化 | i18next、`react-i18next` |
| 缓存/标签页 | `react-activation`（KeepAlive）、`screenfull`（全屏） |
| 代码规范 | ESLint（`@typescript-eslint` + react-hooks + prettier）、Prettier（`useTabs`、`printWidth 130`、`singleQuote false`）、stylelint、lint-staged |

## 3. 环境与运行

### npm scripts（`package.json`）

| 命令 | 说明 |
| --- | --- |
| `npm run dev` / `serve` | 启动本地开发（Vite，端口见 `.env` 的 `VITE_PORT=1688`） |
| `npm run build:dev` | `tsc && vite build --mode development` |
| `npm run build:test` | `tsc && vite build --mode test` |
| `npm run build:prod` | `tsc && vite build --mode production` |
| `npm run preview` | 预览构建产物 |
| `npm run lint:eslint` | ESLint 全量修复（`--fix`） |
| `npm run lint:prettier` | Prettier 格式化 |
| `npm run lint:stylelint` | stylelint 修复 less/css |
| `npm run lint:lint-staged` | 提交前按 staged 文件检查 |

### 环境变量（`.env*` 文件）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_GLOB_APP_TITLE` | `Go-Admin` | 页面标题（注入 index.html） |
| `VITE_PORT` | `1688` | 开发端口 |
| `VITE_OPEN` | `true` | dev 启动自动开浏览器 |
| `VITE_REPORT` | `false` | 是否生成包预览 |
| `VITE_BUILD_GZIP` | `false` | 是否 gzip 压缩 |
| `VITE_DROP_CONSOLE` | `true` | 生产移除 console |
| `VITE_API_URL` | - | 后端接口 baseURL：dev=`http://localhost:8888`，test=`http://120.48.157.250:60000`，prod=空（同源） |

`src/utils/getEnv.ts` 提供 `wrapperEnv`（把 `"true"/"false"` 转布尔、`VITE_PORT` 转数字、`VITE_PROXY` JSON 解析并写入 `process.env`）与 `getEnvConfig`。

### 全局别名的映射

- `@/* → src/*`（tsconfig + vite alias）。
- `@shared/* → ../shared/*`（tsconfig 声明，当前未使用）。

### 包管理

`package-lock.json` 存在；`overrides` 强制 `inflight`/`glob`/`rimraf` 版本；`allowScripts` 放行 esbuild/es5-ext。

## 4. 目录结构

```
admin/
├─ index.html                 # Vite HTML 入口（含首屏 loading）
├─ package.json / tsconfig.json / vite.config.ts
├─ vite.config.ts             # 别名/less/gzip/html 标题/构建分包
├─ .env  .env.development  .env.test  .env.production
├─ public/favicon.ico
├─ docs/                      # 本说明文档
└─ src/
   ├─ main.tsx                # 启动：全局样式 + Provider + PersistGate + App
   ├─ App.tsx                 # 国际化 / ConfigProvider / HashRouter / AuthRouter / AliveScope
   ├─ api/                    # 接口层（按域分包），见 02 文档
   │   ├─ admin/sys/         # 系统管理（登录、用户、部门、字典、岗位、角色、菜单、API、参数、日志、工具）
   │   ├─ app/user/          # App 端用户域
   │   └─ plugins/           # 插件域（消息、内容、文件管理）
   ├─ config/                 # 全局常量（HOME_URL/LOGIN_URL 等）、NProgress、loading、分页
   ├─ components/             # 通用组件（见 §12）
   ├─ enums/                  # SysStatus/SysMenuType、ResultEnum、RequestEnum、ContentTypeEnum
   ├─ hooks/                 # useMessage/useTime/useEcharts
   ├─ language/              # i18next 资源 zh/en
   ├─ layouts/               # 主布局（Sider+Header+Tabs+内容+Footer）
   ├─ redux/                 # store 与各模块 reducer/action
   ├─ routers/               # 静态路由、动态路由、路由守卫、懒加载
   ├─ styles/                # reset/common/var.less
   ├─ typings/               # 全局类型声明（*.d.ts）
   ├─ utils/                 # util、is、echarts、request、getEnv
   └─ views/                 # 页面（admin/sys、app/user、plugins）
```

## 5. 启动与初始化流程

```
index.html ─▶ src/main.tsx
  ├─ 引入全局样式：assets/fonts/font.less、assets/iconfont/iconfont.less、styles/reset.less、styles/common.less
  ├─ import "src/language/index"  # 初始化 i18next
  ├─ createRoot(#root).render(<React.StrictMode>
  │     <Provider store={store}>          # redux
  │       <PersistGate persistor={persistor}>  # localStorage 恢复 → token/routeList/语言等
  │         <App/>
  └─ App.tsx:
      ├─ 根据 redux language 或浏览器语言，设置 i18n 与 antd locale（zhCN/enUS）
      ├─ <ConfigProvider locale/> <AppLayout>
      │   <AliveScope>（react-activation，页面缓存容器）
      │     <HashRouter> <AuthRouter>（路由守卫） <Router/>（路由注册） </HashRouter>
```

## 6. 路由体系（`src/routers/`）

### 6.1 路由结构

- **静态路由** `rootRouter`：`/`（重定向到 `/login`）、`/login`、`/403`、`/404`、`/500`（`routers/index.tsx` 内定义）。
- **动态路由** `dynamicRouter(rList)`：由后端下发的 `global.routeList`（`RouteObjectType[]`，来自 `getMenuRoleApi`）拼装生成
  - 对每个菜单项：`menuType==MENU(2)` 且 `isFrame=false` → 顶层独立路由；`MENU`/`DIRECT(1)` → 挂到 `LayoutIndex` 的 children。
  - `element` 字段为字符串时，通过 `import.meta.glob("@/views/**/*.tsx")` 匹配 `modules["/src/views" + element + ".tsx"]` 做懒加载（`lazyLoad` 包装 `Suspense`+Spin）。
  - `redirect` 存在则替换为 `<Navigate>`。
- 处理后的菜单项统一挂到 `LayoutIndex` 路由的 children 下，由 `<Outlet>` 渲染页面内容。

### 6.2 常量（`src/config/index.ts`）

- `HOME_URL="/home"`
- `LOGIN_URL="/login"`
- `PROFILE_URL="/profile"`
- `DICT_DATA_URL="/admin/sys/sys-dictdata"`
- `GEN_EDIT_TABLE="/admin/sys/sys-tools/sys-gen/edit"`
- `TABS_BLACK_LIST=["/403","/404","/500","/layout","/login","/dataScreen"]`

### 6.3 路由守卫 `AuthRouter`（`routers/utils/authRouter.tsx`）

- 每次路径变化触发：先 `axiosCanceler.removeAllPending()` 取消未完成请求。
- 无 token → 跳 `/login`；有 token 且正在 `/login` → 跳 `HOME_URL`。

### 6.4 菜单类型枚举（`src/enums/base.ts`）

- `SysStatus.TRUE="1" FALSE="2"`（是否外链/是否显示等开关）。
- `SysMenuType.DIRECT="1" MENU="2" BUTTON="3"`。

## 7. 状态管理（Redux，`src/redux/`）

- **组合 reducer**：`global`、`menu`、`tabs`、`auth`、`breadcrumb`。
- **中间件**：`reduxThunk`、`reduxPromise`；**持久化**：`redux-persist`，storage=localStorage，key=`redux-state`。
- **DevTools**：`window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`。
- **变更类型**：集中在 `src/redux/mutation-types.ts`（如 `SET_TOKEN`、`SET_USER_INFO`、`SET_ROUTE_LIST`、`SET_MENU_LIST`、`SET_TABS_LIST`、`SET_BREADCRUMB_LIST`、`SET_AUTH_BUTTONS`、`SET_AUTH_ROUTER`、`UPDATE_COLLAPSE` 等）。
- reducer 全部用 `immer` 的 `produce` 编写。

### 各模块状态

| 模块 | 字段 | 说明 / Action |
| --- | --- | --- |
| `global` | `token`、`userInfo`、`routeList`、`assemblySize`、`language`、`themeConfig{primary,isDark,breadcrumb,tabs,footer}` | `setToken`、`setUserInfo`（非 http 开头 avatar 自动前缀 `VITE_API_URL`）、`setRouteList`、`setAssemblySize`、`setLanguage`、`setThemeConfig` |
| `menu` | `isCollapse`、`menuList` | `updateCollapse`、`setMenuList` |
| `tabs` | `tabsActive`、`tabsList`（默认含「首页」`HOME_URL`） | `setTabsList`、`setTabsActive`（`tabsActive` 实际未使用） |
| `auth` | `authButtons`、`authRouter` | `setAuthButtons`、`setAuthRouter`（按钮权限 map + 扁平路由权限） |
| `breadcrumb` | `breadcrumbList`（pathname → 标题数组） | `setBreadcrumbList` |

### 组件读取状态的方式

- 多数组件用 `react-redux` 的 `connect(mapStateToProps, mapDispatchToProps)`（classic HOC 模式）。
- 有些直接 `store.getState()` / `store.dispatch()`（如路由、请求拦截器、`HocAuth`）。
- ⚠️ `redux/index.ts` 导出的 `useDispatch`/`useSelector` 是**占位实现**，不可用。

## 8. 请求层（`src/utils/request/`）

### RequestHttp（`request/index.ts`）

- `axios.create`，`baseURL = VITE_API_URL`，`timeout=90s`，`withCredentials=false`。
- **请求拦截器**：
  - `NProgress.start()`；
  - 请求自动展示全屏 loading（除非 header 带 `noLoading: true` 标记）；
  - 若 redux `global.token` 存在，注入 `Authorization: Bearer <token>`。
- **响应拦截器**（成功分支）：
  - `NProgress.done()` + 关闭 loading；
  - `data.code === ResultEnum.OVERDUE(401)`：清 token（`setToken("")`）、报错、跳登录页；
  - `data.code === ResultEnum.UNAUTH(403)`：提示并 reject；
  - 否则返回整个 `data`（即 `{code,msg,data}`）。
- **响应拦截器**（失败分支）：超时单独提示；按 HTTP 状态交给 `checkStatus` 弹对应中文提示；断网跳 `/500`。
- **封装的方法**：`get/post/put/delete<T>`（返回 `Promise<ResultData<T>>`）、`download`（`responseType=blob`）。
- 额外约定：`ApiService` 层可通过第三个参数 `{ loading: true }`（`post/put`）或 `{ headers: { noLoading: true } }` 控制 loading 行为。

### checkStatus（`helper/checkStatus.ts`）

HTTP 状态 400/401/403/404/405/408/500/502/503/504 分别提示对应中文 `message.error`。

### axiosCancel（`helper/axiosCancel.ts`）

`AxiosCanceler` 基于 `CancelToken` 管理 pending 请求：`addPending`/`removePending`/`removeAllPending`（路由守卫在切换路由时清空历史请求）。去重 key 由 method+url+序列化 params/data 组成。

### 请求类型（`utils/request/interface/index.ts`）

```ts
interface Result { code: number; msg: string }
interface ResultData<T> extends Result { data: T }
interface ReqPage { current?: number; pageSize?: number }
interface ResPage<T> { list: T[]; count: number; extend: T; pageIndex: number; pageSize: number }
```

### 业务码枚举（`src/enums/httpEnum.ts`）

- `ResultEnum.SUCCESS=200`、`ERROR=500`、`OVERDUE=401`、`UNAUTH=403`、`TIMEOUT=10000`、`TYPE="success"`。
- `RequestEnum`、`ContentTypeEnum`（JSON/TEXT/FORM_URLENCODED/FORM_DATA）。

## 9. 布局（`src/layouts/`）

布局树（`layouts/index.tsx`）：

```
<section class="container">
  <Layout.Sider width=220 theme=dark collapsed=isCollapse trigger=null>
    LayoutMenu（Logo + antd Menu）
  </Layout.Sider>
  <Layout>
    LayoutHeader（折叠按钮 + 面包屑 | 语言 + 全屏 + 用户名 + 头像下拉）
    LayoutTabs（可关闭标签页 + “更多”按钮）
    <KeepAlive name=pathname when={false}>
      <Content><Outlet/></Content>     # 页面内容 + react-activation 缓存
    </KeepAlive>
    LayoutFooter（版权，`themeConfig.footer` 控制隐藏）
  </Layout>
</section>
```

- 响应式：窗口 < 1200px 自动折叠侧边栏，> 1200px 展开。
- 布局组件整体为 antd `Layout`（注意代码用 `<section class="container">` 包两层 Layout 避免切页闪屏）。
- `themeConfig.breadcrumb` 控制面包屑、`tabs` 控制标签页、`footer` 控制页脚渲染。

### Header 子组件

- `CollapseIcon`：折叠/展开侧边栏。
- `BreadcrumbNav`：根据 `breadcrumb.breadcrumbList[pathname]` 渲染面包屑（首页恒在最前）。
- `Language`：zh/en 下拉，dispatch `setLanguage`。
- `Fullscreen`：基于 `screenfull`。
- `AvatarIcon`：头像下拉：个人信息（跳 `PROFILE_URL`）、退出登录（清 token → 跳登录）。
- `PasswordModal` / `InfoModal`：`useImperativeHandle` 暴露 `showModal`，分别为改密/个人信息弹窗。

### Tabs 子组件

- `MoreButton`：下拉「关闭当前/关闭其他/关闭全部」，文案走 i18n（`tabs.*`）。

### Menu 子组件（layouts/components/Menu）

- `Logo.tsx`（品牌 Logo）。
- 菜单来 Tree（`deepLoop` 递归把后端菜单转 antd items，跳过 `isHidden`，图标用 `@ant-design/icons` 按名字字符串渲染）。
- 菜单数据来自 `global.routeList`；点击时通过 `searchRoute` 查找路由，若为外链则 `window.open`。

## 10. 权限

- **页面/菜单权限**：登录时 `getMenuRoleApi()` 返回用户的动态路由（菜单树），存入 `global.routeList` → 动态注册路由 → 无权限路由不注册即不可访问。
- **按钮级权限**：`src/components/HocAuth/index.tsx` 的 `AuthButton`：读 `global.userInfo.permissions`，命中任意所需权限或 `"*:*:*"` 则渲染插槽，否则返回 `null`。用法如：
  ```tsx
  <AuthButton permission={["admin:sys-user:add"]}>新增</AuthButton>
  ```

## 11. 国际化（`src/language/`）

- i18next 初始化，资源命名空间 `translation`，`fallbackLng='zh'`。
- `zh.ts`/`en.ts` 键结构：`login.*`、`home.*`、`tabs.*`、`header.*`。
- 语言切换：Header 的 `Language` 组件 dispatch `setLanguage`；`App.tsx` 用它同步 `i18n.changeLanguage` 与 antd `locale`。
- 语言持久化在 redux `global.language`（经 redux-persist 落 localStorage）。

## 12. 通用组件（`src/components/`）

| 组件 | 功能 |
| --- | --- |
| `ErrorMessage/404|403|403|500` | 错误页（antd Result + 返回首页） |
| `HocAuth` | `AuthButton`，按钮权限控制，见 §权限 |
| `Icon` | 按名字字符串渲染 `@ant-design/icons`；`IconFont` 使用阿里 iconfont |
| `IconSelect` | 表单图标选择器（Outlined/Filled/TwoTone 分组网格） |
| `Loading` | 全屏加载（request-loading 样式，id=`#loading`） |
| `LoadingButton` | 自管理 loading 的按钮，`onClick(done, event)` 手动结束 |
| `LoadingSwitch` | 支持异步 `onChange(): Promise` 的开关，等待期间 spin |
| `SwitchDark` | 深浅色主题开关（写 `global.themeConfig`） |

## 13. Hooks 与工具

- `useMessage`（含 module 级导出 `message`/`modal`/`notification`）、`useTime`（`useTimes` 每秒刷新当前时间）、`useEcharts`（echarts 初始化 + 响应式，返回 `[ref]`）。
- `src/utils/util.ts`：`localGet/localSet/localRemove/localClear`、`getBrowserLang`、`getOpenKeys`、`searchRoute`、`getBreadcrumbList`、`findAllBreadcrumb`、`handleRouter`、`isType`、`deepCopy`、`randomNum`、`parseFlatMenuList`。
- `src/utils/index.ts`：`saveExcelBlob`/`saveZipBlob`（Blob 下载）、`formatDataForProTable`（`ResPage→ProTable RequestData`）、`formatDataListForProTable`。
- `src/utils/is/index.ts`：一组运行时类型判断（`isFunction/isObject/isPromise...`）。
- `src/utils/echarts/index.ts`：按需注册 echarts 组件并导出 `ECOption`。

## 14. 类型声明（`src/typings/`）

- `global.d.ts`：`namespace Menu`、`Recordable<T>`、`ViteEnv`、`MenuInfo`。
- `window.d.ts`：`__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`、`navigator.browserLanguage` 等浏览器扩展。
- `plugins.d.ts`：若干第三方模块的类型占位。
- 注意：`import.meta.env` 未被显式声明类型（无 `reference types=vite/client`），仅 `.env` 键在 `ViteEnv` 接口描述，实际以字符串读用。

## 15. 样式

- `src/styles/var.less`：`@primary-color:#1890ff`，在 `vite.config.ts` 中通过 `additionalData` 全局注入每个 less。
- `src/styles/reset.less`：重置样式；`src/styles/common.less`：通用工具类（flex/单行省略/双行省略/卡片/滚动条）。
- `index.html` 内含首屏四圆点 loading 动画样式。