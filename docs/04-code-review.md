# 04 — 代码审核报告

> 审核时间：2026-08-04（工作区：`D:\Note\OpenCode\selfplatform\admin`，含未提交改动）
> 方法：全量通读核心框架与全部页面/API 代码 + `npx tsc --noEmit` 类型检查 + 关键结论逐条人工复核。
> 结论摘要：**阻断性问题 2 项、高危 7 项、中危 16 项、低危 10 项**（编号 B/H/M/L）。
> 修复状态：**B1、B2、H1-H7、M1-M16、L1-L10 全部已修复 ✅**（2026-08-04，见下文各节“已修复”说明）。

---

## 一、阻断性问题（不解决则无法开发/构建/运行）

### B1. 依赖缺失，项目无法启动与构建（高危）—— 已修复 ✅

> 修复方式（2026-08-04，按“移除残留引用”方向）：
> - `vite.config.ts`：删除 `createSvgIconsPlugin` 的 import 与 plugins 中的插件调用（其 iconDirs 指向的 `src/assets/icons` 目录本就不存在）。
> - `src/views/plugins/content/content-article/components/FormModal.tsx`、`content-announcement/components/FormModal.tsx`：移除 `dRichTextEditor` 与 `@wangeditor/...css` 引用，暂用 `Input.TextArea` 兜底。
> - 删除已无引用的 `src/components/svgIcon/`（index.tsx）。
> - 复核：全库已无 `@wangeditor` 相关引用，`tsc` 中 wangeditor/svg-icons 报错清空。
> - **后续（2026-08-04）**：已用 Tiptap（`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-underline`，3.29.2）实现 `src/components/RichTextEditor/`（工具栏：加粗/斜体/下划线/删除线/标题/列表/引用/代码块/分隔线/清除格式/撤销重做；与 antd Form 双向绑定、HTML 字符串存取），并替换 `content-article`、`content-announcement` 表单的“内容”字段（`Form.Item name="content"`，含空内容校验）。`npx tsc --noEmit` 0 错误，`npm run build:dev` 构建成功。

历史问题描述：

- `vite.config.ts:6` 引用了 `vite-plugin-svg-icons-new` 的 `createSvgIconsPlugin`，但该依赖已从 `package.json`（工作区未提交改动中被删除）移除且 `node_modules` 中不存在 → **`npm run dev` / `npm run build:*` 在加载 vite 配置时直接崩溃**。
- `src/components/RichTextEditor/index.tsx:1-3` 引用了 `@wangeditor/editor`、`@wangeditor/editor-for-react`，同样未在 `package.json` / lock 中声明、未安装；该组件被 `content-article`、`content-announcement` 的表单引用 → 打包与类型检查报模块找不到。
- 修复方向（任意一种）：**重装依赖**（`npm i @wangeditor/editor @wangeditor/editor-for-react vite-plugin-svg-icons-new`）或**移除引用**（本项目已按此方向完成）。

### B2. `tsc` 无法通过，`build:*` 脚本（`tsc && vite build`）全部失败 —— 已修复 ✅

> 修复方式（2026-08-04）：
> - `tsconfig.json`：`module: "Node16"` → `"ESNext"`，`moduleResolution: "Node16"` → `"Bundler"`（Vite 项目的标准配置，支持 `import.meta.*` 与 ESM-only 依赖）。
> - `src/vite-env.d.ts`：新增 `/// <reference types="vite/client" />`（补齐 `import.meta.env/glob` 类型与 png/jpg/less 等资源模块声明）。
> - 验证结果：`npx tsc --noEmit` **0 错误**；`npm run build:dev`（`tsc && vite build --mode development`）**构建成功**（18.45s，输出至 `dist/`）。

历史问题描述：

- `package.json` 无 `"type": "module"`，但 `tsconfig.json` 配置了 `module: Node16` → 所有 `import.meta.*`（`src/routers/index.tsx:57`、`src/utils/request/index.ts:17`、`src/redux/modules/global/action.ts:20`）及 ESM-only 依赖（`echarts`、`screenfull`）触发 TS1479/TS1470/TS2497。
- 缺少 `vite/client` 类型引用（`vite-env.d.ts` 里只有 less 声明），`import.meta.env/glob` 类型不可用；png 等资源导入无类型声明（TS2307，如 `login/index.tsx`、`home/index.tsx`）。
- `src/utils/echarts/index.ts` 对 `echarts/charts`、`echarts/components` 等子路径导入全部报「无导出成员」，实际是 `moduleResolution` 错误导致无法解析类型。
- `vite.config.ts` 报 `ConfigEnv/defineConfig/loadEnv` 不存在、`vite-plugin-svg-icons-new` 找不到。
- 修复方式：`module`/`moduleResolution` 改为 `ESNext`/`Bundler`，`vite-env.d.ts` 增加 `/// <reference types="vite/client" />` 与资源模块声明，再补全缺失依赖（缺失依赖部分见 B1，已同步修复）。

---

## 二、高危问题

### H1. Redux 假 hooks（`src/redux/index.ts` 原 43-49 行）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `src/redux/index.ts`：删除 `useDispatch`/`useSelector` 存根，改从 `react-redux` 导出真实 hooks，并补齐类型：`useDispatch = useReduxDispatch<AppDispatch>()`、`useSelector: TypedUseSelectorHook<RootState> = useReduxSelector`。
> - `src/views/admin/sys/profile/index.tsx`：选择器由不存在的 `state.user.userInfo` 改为 `state.global.userInfo`；`setUserInfo` 改从 `@/redux/modules/global/action` 引入。
> - `removeTab` 实为副作用工具（`modal.confirm` 提示），并非 redux action：三处 `dispatch(removeTab(...))` 改为直接调用（`profile` ×2、`sys-gen/edit` ×2），并移除 `sys-gen/edit` 中随之失效的 `useDispatch`。
> - 删除已无引用的绕行补丁 `src/redux/modules/user/index.ts`。
> - 验证：`npx tsc --noEmit` 0 错误。遗留：`profile` 表单的 `initialValues` 异步不回填（对应 **M5**，未在本项处理）。

历史问题描述：

`useDispatch`（返回 `(_) => {}`，派发静默无效）与 `useSelector`（忽略选择器、不订阅、恒返回 `global.userInfo`）是**存根实现**（并非真正可用的 hook），组件实际通过 `react-redux` 的 `connect` 或直接 `store.getState()`/`store.dispatch()` 存取状态。
被真实使用的位置：`src/views/admin/sys/profile/index.tsx:16-17` 调用 `useSelector(state => state.user.userInfo)`（`state.user` 甚至不存在）并 `dispatch(setUserInfo(...))`。
**影响**：个人资料页异步拉取的用户信息被 `dispatch` 丢弃、表单 `initialValues` 永远为空且刷新后无法回填；该页“保存”后 redux 里仍是旧数据。`src/redux/modules/user/index.ts` 只是绕行补丁，未解决根因。
**修复**：删除存根，`export { useDispatch, useSelector } from "react-redux"`，并将选择器改为 `state.global.userInfo`。

### H2. 请求 loading 意图失效，全屏 loading 无法关闭（`src/utils/request/index.ts:39`）

拦截器判断的是 `config.headers.noLoading`，但唯一显式声明 loading 的 `logoutApi`（`api/admin/sys/sys-user/index.ts:88`）传的是第三个参数 `{ loading: true }` → 落到 `config.loading`，从未被读取。
**影响**：所有请求（列表查询、字典轮询等）都会弹全屏 loading 且无关闭途径；而注释宣称的 `noLoading` 机制也没有任何调用方。`CustomAxiosRequestConfig.loading` 形同虚设。
**修复**：`if (config.loading && !config.headers?.noLoading) showFullScreenLoading()`，并让各 API 显式传 `{ loading: true/false }`。

### H3. 动态路由 element 解析崩溃风险（`src/routers/index.tsx` 原 67 行）—— 已修复 ✅

> 修复方式（2026-08-04）：`dynamicRouter` 中先取 `modules["/src/views" + item.element + ".tsx"]`，未命中时回退到 `lazyLoad(lazy(404 页面组件))`，不再对 `undefined` 调用 `React.lazy`；单条菜单 element 缺失不再影响整棵动态路由。验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`lazy(modules["/src/views" + item.element + ".tsx"])`：后端返回的 `element` 若带前导 `/`、拼写不一致或文件不存在，`modules[key]` 为 `undefined` → `React.lazy(undefined)` 抛错，`dynamicRouter` 整体失败，**所有用户页面打不开**。
**修复**：`const comp = modules[key]; item.element = comp ? lazyLoad(lazy(comp)) : lazyLoad(lazy(404))`。

### H4. 头像为空时拼出 `undefined` 字符串（`src/redux/modules/global/action.ts:18-21`）—— 已修复 ✅

> 修复方式（2026-08-04）：拼接条件改为 `userInfo.avatar && !userInfo.avatar.startsWith("http")`，avatar 为空（`undefined`/`""`）时保持原值不再拼接。验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`userInfo.avatar` 为 `undefined` 时，`if (!avatar?.startsWith("http"))` 为真 → 赋值为 `VITE_API_URL + undefined`，得到 `http://hostundefined`。
**修复**：仅当 `avatar` 有值时拼接：`if (userInfo.avatar && !userInfo.avatar.startsWith("http"))`。

### H5. userInfo 为 null 时的空指针崩溃（`HocAuth`、Header）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `src/components/HocAuth/index.tsx:17`：通配符判断加 `uInfo &&` 前置守卫，uInfo 为 null 时不再解引用。
> - `src/layouts/components/Header/index.tsx:24`：`{uInfo.username}` → `{uInfo?.username}`。
> - `src/layouts/components/Header/components/AvatarIcon.tsx:67`：`src={uInfo.avatar}` → `src={uInfo?.avatar}`。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

- `src/components/HocAuth/index.tsx:17`：`uInfo.permissions?.length` 在 `uInfo` 为 `null`（初始状态/刷新后 profile 未返回前）时抛 `Cannot read properties of null`，导致使用 `AuthButton` 的页面整块崩溃。需 `uInfo?.permissions?.length`。
- `src/layouts/components/Header/index.tsx` 与 `AvatarIcon.tsx:67` 直接读 `uInfo.username` / `uInfo.avatar`，同样的 null 解引用问题，会白屏整个头部。
- **修复**：全部改为可选链。

### H6. 菜单外链 window.open 打开的是字典值而不是外链地址（`src/layouts/components/Menu/index.tsx:98-100`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - 对照后端 `adminserver/app/admin/sys/models/sys_menu.go` 与 `service/dto/sys_menu.go` 确认语义：`isFrame = "内嵌 1-是 2-否"`（1=内嵌、2=非内嵌/外链）。所以 `route.isFrame === SysStatus.FALSE` 判定「外链」本身**没有写反**，原文档的“疑似写反”不成立。
> - 真正的 bug：`window.open(route.isFrame)` 把字典值字符串 `"2"` 当 URL 打开，而非外链地址 `route.path`；且打开后仍执行 `navigate(key)` 跳转本 SPA 路由。`dynamicRouter`（`routers/index.tsx:74-76`）把非内嵌 MENU 提升为顶层路由，语义自洽，无需改动。
> - 修复后：`isFrame === SysStatus.FALSE`（外链）→ `window.open(route.path, "_blank")` 并 `return`，不跳转本地路由；内嵌页面正常 `navigate(key)`。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`if (route.isFrame === SysStatus.FALSE) window.open(route.isFrame, "_blank")` —— `SysStatus.FALSE === "2"`：非外链菜单（`"2"`）反而执行 `window.open("2")` 打开一个名为 “2” 的窗口，外链菜单（`"1"`）却只走 `navigate(key)` 跳转本地路由。`dynamicRouter`（`routers/index.tsx:74-76`）中的 `isFrame == FALSE` 判断语义同样可疑。
**修复**：确认后端数据模型后改为 `isFrame === SysStatus.TRUE` 时 `window.open(route.isFrame)`。

### H7. 菜单编辑中接口授权双重绑定，勾选结果不可用（`sys-menu/components/FormDrawer.tsx:343-358`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - 按 `sys-role/components/FormModal.tsx` 处理 `menuIds` 的既有惯例：Form.Item 去掉字段名，仅承担布局（`<Form.Item label="授权接口">`），不再注入与 state 冲突的 `value`/`onChange`。
> - `Transfer` 继续由 `apiSelectKeys` state 受控；提交时显式合并 `{ ...values, apis: apiSelectKeys }`，新增/编辑都能拿到勾选结果。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`<Form.Item name="apis">` 与 `<Transfer targetKeys={apiSelectKeys}>` + 自有 `onChange` 同时接管同一份数据：Form.Item 注入的 value/onChange 与显式 state 互相覆盖，勾选的接口列表无法正确回显/保存（新增时 `values.apis` 为 undefined，编辑时提交的是旧值）。
**修复**：二选一 —— 只保留 Form.Item 绑定，或只保留受控 state 并在提交时显式合并 `apiSelectKeys`（参考 `sys-role` 里 `menuIds` 的处理方式）。

---

## 三、中危问题

### M1. `sys-dictdata` 刷新即崩溃（`views/admin/sys/sys-dictdata/index.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `src/views/admin/sys/sys-dictdata/index.tsx`：改用 `useSearchParams` 读取 `?dictType=`，回退兼容 `location.state?.dictType`，两处不再解引用 null。
> - `src/views/admin/sys/sys-dicttype/index.tsx`：`handleToDataClick` 改为 `navigate(\`${DICT_DATA_URL}?dictType=${encodeURIComponent(dictType)}\`)`，跳转时把 dictType 写入 URL，刷新/新开标签可恢复。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`location.state` 未判空直接使用 `state.dictType`；直接刷新/新开标签进入该页时 `state` 为 `null`，整个页面抛错。改为 `state?.dictType || ""`。

### M2. `sys-gen` 删除后按钮永久 loading（`views/admin/sys/sys-tools/sys-gen/index.tsx:302`）—— 已修复 ✅

> 修复方式（2026-08-04）：`finally { done; }` → `finally { done(); }`，删除流程结束（含失败）后都能复位 LoadingButton。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

删除确认的 `finally` 块里是 `done;`（表达式未调用），`LoadingButton` 的 done 从未执行，按钮永远转圈。改为 `done();`。

### M3. `sys-gen/edit` 表单校验未 await（`views/admin/sys/sys-tools/sys-gen/edit/index.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：`baseInfoForm.validateFields()` / `genInfoForm.validateFields()` 均加 `await`，校验失败的 Promise rejection 能被 try/catch 捕获，错误提示正常弹出，后续提交不再执行。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`baseInfoForm.validateFields()` / `genInfoForm.validateFields()` 未 `await`：校验失败时 Promise 异步 reject 未被 try/catch 捕获，提交继续执行，错误提示也不出现。改为 `await` 两个校验。

### M4. `sys-monitor` 空数组解引用（`views/admin/sys/sys-tools/sys-monitor/index.tsx:74`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `monitor?.cpu.cpuInfo[0].modelName` → 加长度守卫，空数组时显示 `"-"`。
> - 顺带修 `data.diskList.forEach` → `data.diskList?.forEach`，后端缺该字段时不再抛错。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`monitor?.cpu.cpuInfo[0].modelName` 无长度守卫（同文件 173 行有守卫），`cpuInfo` 为空时页面崩溃。用 `monitor?.cpu.cpuInfo?.[0]?.modelName`。

### M5. `profile` 表单不回填（`views/admin/sys/profile/index.tsx:24-32,149-158`）—— 已修复 ✅

> 修复方式（2026-08-04）：`getUserInfo()` 拿到 `userInfo` 后，在 `dispatch(setUserInfo(...))` 的同时调用 `userInfoform.setFieldsValue({ username/phone/email/sex })`，刷新进入页面也能回填。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`initialValues` 在首次渲染（userInfo 尚未就绪）时计算；异步获取到信息后没有 `form.setFieldsValue`，刷新进入页面时表单空白。配合 H1 一起修。

### M6. 角色授权只保存勾选节点、丢弃半选父节点（`sys-role/components/FormModal.tsx`、`DataScopeModa.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - 两处 `onCheck` 改为 `setMenuSelect([...checkedKeys, ...(halfChecked.halfCheckedKeys || [])])`（deptSelect 同理）。
> - 依据：后端 `adminserver/app/admin/sys/service/sys_role.go`（UpdateRole 的 `Association("SysMenu").Replace`、UpdateDataScope 的 `Association("SysDept").Replace`）只存前端传入的 ID，不会自动补父节点，半选父级必须由前端带上。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`onCheck` 只取 `checked`（`checkStrictly` 关闭时半选父节点在 `halfChecked` 中），保存后父级继承权限被悄悄丢失。应合并 `[...checked, ...halfCheckedKeys]` 或改用 `checkStrictly`。
另外两个弹窗用 `setTimeout(..., 500)` 延迟设置 `menuIds/deptIds` 且无清理：快速连续打开不同角色时会把上一个角色的勾选状态套到新表单。建议改为按 `row` 同步设置。

### M7. 角色状态开关失败后 UI 不还原（`sys-role/index.tsx:77-89`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `handleStatusChange` 改为 try/finally：`action.reload()` 放 `finally`，无论成功失败都刷新，失败时开关视觉还原到实际状态。
> - 渲染层给 admin 角色隐藏开关（`record.roleKey !== "admin" &&`，与 sys-user 的 `username !== "admin"` 一致）；后端 `sys_role.go:250` 本就禁止禁用 admin 角色，前端提前屏蔽避免误导。
> 验证：`npx tsc --noEmit` 0 错误。`sys-user/index.tsx` 同类问题仍属低危未处理（见 L 项）。

历史问题描述：

`changeRoleStatusApi` 失败（code !== 200）时未 `reload`，开关视觉停留在切换后位置与实际不符；且无 admin 角色保护（`sys-user` 有 `username !== 'admin'` 保护）。失败路径补 `action.reload()` 或回滚。`sys-user/index.tsx:122-131` 存在同样问题（低危）。

### M8. 按钮权限标注错误/缺失（`sys-post/index.tsx`、`sys-operlog/index.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `sys-post/index.tsx`：“编辑”按钮权限由 `admin:sys-post:query` 改为 `admin:sys-post:edit`（对照种子数据 `admin_sys_menu` id 30）。
> - `sys-operlog/index.tsx`：
>   - “详情”补包 `<HocAuth permission={["admin:sys-oper-log:query"]}>`（GET /:id 无独立按钮权限点，复用列表查看权限）。
>   - “删除”由 `admin:sys-oper-log:query` 改为 `admin:sys-oper-log:del`（种子 id47）。
>   - 工具栏“Excel导出”补包 `<HocAuth permission={["admin:sys-oper-log:export"]}>`（种子 id114）。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

- 岗位“编辑”按钮用的是 `admin:sys-post:query`，应改为 `:edit`（只有查询权限的用户可打开编辑弹窗）。
- 操作日志“详情”无 HocAuth、删除用 `:query` 而非 `:del`、导出未包权限。需与后端权限点对齐。

### M9. 请求取消机制是死代码（`utils/request/helper/axiosCancel.ts` + `request/index.ts`）—— 已修复 ✅

> 修复方式（2026-08-04）：`RequestHttp` 构造时实例化 `this.axiosCanceler = new AxiosCanceler()`，并在拦截器中接入：
> - 请求拦截器：`this.axiosCanceler.addPending(config)`（重复请求取消前一个）；
> - 响应成功：`removePending(response.config)`；响应失败/取消：`error.config && removePending(error.config)`。
> 现在 `pendingMap` 有真实条目，`authRouter.tsx:18` 每回路由切换调用的 `removeAllPending` 真正生效。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`addPending`/`removePending` 从未在拦截器中被调用，`pendingMap` 恒为空；`AuthRouter` 每次路由切换调用 `removeAllPending` 实际无任何效果（无法取消重复请求/历史请求）。

### M10. 路由守卫只校验 token、无兜底路由（`routers/utils/authRouter.tsx`、`routers/index.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `routers/index.tsx`：`rootRouter` 末尾新增 `{ path: "*", element: 404 }` 兜底，未匹配路由不再白屏。
> - `routers/utils/authRouter.tsx`：守卫接入 `store.getState().auth.authRouter`（菜单扁平化后的权限路径数组，含 `/profile`、`sys-gen/edit` 等隐藏页，均有后端菜单种子）。路径不在权限列表、也不在白名单（`/`、login、403/404/500、home）时跳 `/403`；`authRouter` 未就绪（空数组）时不拦截，避免 rehydrate 竞态误伤。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

- `authRouter` 只判断 token 存在，不校验 `pathname` 是否在权限路由列表内（`auth` 模块的 `authRouter` 已计算但从被使用），深链接可访问任意已注册路由，未注册路径直接访问也不拦截。
- `rootRouter` 无 `path: "*"`：访问 `/profile` 等后端未下发菜单的路径时**白屏**。应加 `{ path: "*", element: <Navigate to="/404" /> }`。

### M11. Tabs 对未知路径插入 `undefined` 标签（`layouts/components/Tabs/index.tsx:35-41`）—— 已修复 ✅

> 修复方式（2026-08-04）：`addTabs` 取到 `route.path`/`route.title` 后先判空，`path` 或 `title` 缺失（login、403/404/500 等不在菜单列表的路由）时只更新 activeValue、不 push，杜绝 `{ title: undefined, path: undefined }` 脏标签与 key 警告。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`searchRoute` 对 `/403`、`/404`、`/500`、`/login` 等返回 `{}`，`addTabs` 仍 push `{ title: undefined, path: undefined }`，产生 key 警告与脏标签。应利用 `TABS_BLACK_LIST`（当前未被引用）过滤或判断 `route.path` 存在才 push。

### M12. 侧边栏折叠后无法自动展开（`layouts/index.tsx:25-33`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - 展开分支条件由 `!isCollapse && screenWidth > 1200` 改为 `isCollapse && screenWidth > 1200`：已折叠时窗口拉大能自动展开。
> - `window.onresize` 改为 `addEventListener` + `removeEventListener`（useEffect 清理），并用 `useRef` 保存最新 `isCollapse`，避免 effect 只跑一次导致的闭包过期。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`if (!isCollapse && screenWidth > 1200) updateCollapse(false)` —— 已折叠（`isCollapse=true`）时该分支永远不成立，窗口拉大也不会展开。同时 `window.onresize` 每次渲染覆盖赋值、无清理，应改用 `addEventListener` 并清理。

### M13. KeepAlive 实际被禁用（`layouts/index.tsx:42`）—— 已修复 ✅

> 修复方式（2026-08-04）：`<KeepAlive name={pathname} when={false}>` 改为按后端下发标记动态计算：`when={searchRoute(pathname, routeList)?.isKeepAlive === SysStatus.TRUE}`，菜单/CURD 维护的 `isKeepAlive`（1=缓存 2=不缓存）真正生效。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`<KeepAlive name={pathname} when={false}>`，`when={false}` 表示不缓存，页面缓存功能整体失效，菜单下发的前端 `isKeepAlive` 标记也未生效。要么去掉该包裹，要么按 `route.isKeepAlive` 动态设置 `when`。

### M14. 会话数据持久化与清理不彻底（`src/redux/index.ts`、`request/index.ts`）—— 已修复 ✅

> 修复方式（2026-08-04），按审核意见采用“仅持久化 UI 状态”方案（用户确认）：
> - `src/redux/index.ts`：`persistConfig` 增加 `whitelist: ["global", "tabs", "menu"]`，并给 `global` 挂 `createTransform`，落盘时只保留 `language/assemblySize/themeConfig` —— token、userInfo、routeList **不再写入 localStorage**，刷新后需重新登录（XSS 无法再窃取 JWT/用户信息/菜单树）。
> - `src/utils/request/index.ts`：新增导出 `resetSession()`（`resetGlobal` + `setTabsList([])` + `setMenuList([])`），登录失效（code 599/OVERDUE）分支改为调用它，不再只清 token。
> - `src/redux/modules/global`：新增 `RESET_GLOBAL` 类型与 `resetGlobal()` action（token/userInfo/routeList 复位为默认值）。
> - `AvatarIcon.tsx` 退出登录同样调用 `resetGlobal()` 并清空 tabs/menu。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

- `persistConfig` 无 `whitelist`：**token、userInfo、routeList** 全量明文落在 localStorage（`redux-state`），XSS 即可窃取 JWT 与用户数据；建议白名单只持久化 UI 类状态（tabs/menu/语言）。
- 响应拦截器 401 分支只 `setToken("")`，userInfo/routeList/tabs 残留，重新登录前旧数据可见。建议清空整份持久化或重置相关 slice。

### M15. 文件上传成功/失败判定错误（`api/plugins/filemgr/filemgr-app/index.ts` + `FormModal.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `exportUploadFileAppApi` 的 `.then` 改为先判 `response.code === ResultEnum.SUCCESS` 再 `onSuccess(response.data, file)`，业务失败走 `onError(new Error(response.msg))`，错误信息不再写入 `localAddress`，也避免误弹“上传成功”。
> - 移除手动 `Content-Type: multipart/form-data`（不带 boundary），交给浏览器/axios 自动生成。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

`exportUploadFileAppApi` 的 `.then` 无条件 `onSuccess(response.data, file)`：后端业务码 `code !== 200` 时（HTTP 仍是 200）也回调成功 → 表单把错误信息写入 `localAddress`、并弹出“上传成功”。应检查 `code === ResultEnum.SUCCESS` 再 onSuccess，否则 onError。
另外手动设置 `Content-Type: multipart/form-data` 不带 boundary，部分网关会拒绝，建议交给浏览器自动生成。

### M16. 图标按名渲染无兜底（`components/Icon/index.tsx`、`layouts/components/Menu/index.tsx`）—— 已修复 ✅

> 修复方式（2026-08-04）：
> - `components/Icon/index.tsx`：`customIcons[name]` 不存在时 `return null`，不再 `React.createElement(undefined)`。
> - `layouts/components/Menu/index.tsx`：`addIcon(name?: string)` 对空名/未知名返回 `null`，并去掉调用处 `item.icon!` 非空断言。
> 验证：`npx tsc --noEmit` 0 错误。

历史问题描述：

后端下发的不存在图标名会 `React.createElement(undefined)` 直接抛错，可导致菜单树渲染失败。需对未知图标回退默认图标。

---

## 四、低危问题

| # | 位置 | 问题 | 建议 |
| --- | --- | --- | --- |
| L1 ✅ | `hooks/useTime.ts:10-17` | effect 依赖 `[time]`（每秒变化），定时器每秒重建 | 已改依赖为 `[]`，定时器只建一次（2026-08-04，tsc 0 错误） |
| L2 ✅ | `hooks/useEcharts.ts:17-33` | `data` 为空数组时不执行 `setOption`，首次渲染空白；`options` 变化不重绘 | 依赖改为 `[data, options]`，去掉 `length !== 0` 判断（2026-08-04，tsc 0 错误） |
| L3 ✅ | `layouts/.../Fullscreen.tsx:8-13` | 卸载清理时注销的是新匿名函数（引用不一致），监听器累积 | 保存 handler 引用再 off（已用具名 `handleChange` 同时 on/off，2026-08-04） |
| L4 ✅ | `utils/util.ts:197-200` | `randomNum(min, max)` 公式区间反向且闭区间错误 | 重写为 `Math.floor(Math.random()*(max-min+1))+min`（2026-08-04） |
| L5 ✅ | `hooks/useTable.ts` | 空壳（`const useTable = () => {}`） | 已删除（全局无调用者，2026-08-04） |
| L6 ✅ | 各列表页 | `columnsState.persistenceKey: "use-pro-table-key"` 全局共用，列配置跨页面串台 | 已按页面生成唯一 key：`"use-pro-table-key-<页名>"`（26 处，2026-08-04） |
| L7 ✅ | `user-level/components/LevelSelectModal.tsx:119` 等 | `rowKey="table"` 字段不存在，应 `rowKey="id"`（ProTable 行选中异常） | `LevelSelectModal`、`CategorySelectModal` 已改 `rowKey="id"`；`DBTableModal` 的 `tableName` 为 `DBTableModel` 真实字段，保留（2026-08-04） |
| L8 ✅ | 导出功能 | 后端异常时返回 JSON 错误体，`saveExcelBlob` 会把它存成 `.xlsx` | 已加 blob 类型校验：`type` 含 `json` 时解析错误体并 `message.error`，不再下载（2026-08-04） |
| L9 ✅ | `utils/request/index.ts` | `request.delete` 把 `{ids}` 放 query（`params`）而非 body，与后端契约需确认 | 契约已确认：后端 DTO 均为 `json:"ids"`（`binding.JSON`），空 body 下绑定 EOF 导致 `ids` 为空、删除静默失效；`request.delete` 已改为 `{ data: params }` 发送 body（2026-08-04） |
| L10 ✅ | `utils/getEnv.ts` | `dotenv` 为未声明的传递依赖；`getEnvConfig/isDevFn` 等为死代码 | 已删除死代码与 `dotenv` 引用，仅保留 `wrapperEnv`（`vite.config.ts` 实际使用）（2026-08-04） |

---

## 五、类型检查现状（`npx tsc --noEmit` 摘要）—— 已恢复 ✅

修复前：因 B2 的模块配置问题，全项目类型检查失败（50+ 错误），覆盖：

- `import.meta` 相关：`routers/index.tsx`、`utils/request/index.ts`、`redux/modules/global/action.ts`（TS1470/TS2339）。
- ESM-only 依赖：`hooks/useEcharts.ts`（echarts）、`layouts/.../Fullscreen.tsx`（screenfull）、`utils/echarts/index.ts`（TS1479 等）。
- 资源/模块缺失：`@wangeditor/*`、`vite-plugin-svg-icons-new`（TS2307）、图片资源（TS2307）、`vite.config.ts` 的 vite 类型（TS2305）。

修复后（2026-08-04）：`npx tsc --noEmit` **0 错误**；`npm run build:dev` 构建成功。

---

## 六、修复优先级建议

1. ~~**立即（阻断）**：B1、B2 —— 恢复依赖、修正 tsconfig，让 dev/build/tsc 可用。~~ **已完成 ✅**
2. **高危优先**：H1（redux hooks）、H3（动态路由 guard）、H5（空指针）—— 直接影响可用性。
3. **数据/权限正确性**：H7、M6、M8、M1、M2、M3。
4. **体验与健壮性**：H2、M4、M5、M7、M9-M13、M15、M16、L1-L10。
