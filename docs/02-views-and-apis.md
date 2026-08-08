# 02 — 页面（views）与 API 清单

> 所有路径相对于 `src/`。接口 baseURL 由环境变量 `VITE_API_URL` 提供，后端统一前缀 `/admin-api/v1`（下文省略该前缀，只写接口路径）。

## 1. 通用约定

### 1.1 请求返回包装（`src/utils/request/interface/index.ts`）

```ts
interface Result { code: number; msg: string }
interface ResultData<T> extends Result { data: T }
interface ReqPage { current?: number; pageSize?: number }   // ProTable 分页参数
interface ResPage<T> { list: T[]; count: number; extend: T; pageIndex: number; pageSize: number }
```

业务码：`200` 成功、`401` 登录失效（拦截器清 token 跳登录）、`403` 无权限。

### 1.2 标准 CRUD 接口命名约定

几乎每个模块都遵循同一模式（`Xxx` 为模块名）：

| 函数 | 方法/路径 | 说明 |
| --- | --- | --- |
| `getXxxPageApi` | GET `/…/xxx` | 分页列表（ProTable 的 `current` 会映射为后端的 `pageIndex`） |
| `getXxxApi` | GET `/…/xxx/{id}` | 详情 |
| `addXxxApi` | POST `/…/xxx` | 新增 |
| `updateXxxApi` | PUT `/…/xxx/{id}` | 修改 |
| `delXxxApi` | DELETE `/…/xxx`（body `{ ids: number[] }`） | 批量删除 |
| `exportXxxApi` | GET `/…/xxx/export` | 导出（`request.download` 返回 blob） |

### 1.3 页面通用模式

- 列表页：`ProTable` + `request` 属性接 API，`formatDataForProTable` 把 `ResPage` 转成 ProTable 期望的 `{success,data,total}`；或直接 `formatDataListForProTable`（树形/非分页）。
- 弹窗表单：同目录 `components/FormModal.tsx`（antd `Form` + `Modal`）。
- 操作按钮权限：`<AuthButton permission={["域:模块:动作"]}>` 包裹。
- 导出：`exportXxxApi().then(blob => saveExcelBlob(文件名, blob))`。
- 状态开关：`LoadingSwitch` + 状态变更接口。

## 2. 页面清单（`src/views/`）

### 2.1 系统管理 `views/admin/sys/`

| 页面 | 说明 |
| --- | --- |
| `login/index.tsx` + `components/LoginForm.tsx` | 登录页：图形验证码 + 用户名/密码（md5）→ `loginApi`；成功后依次 `getUserProfileApi`、`getMenuRoleApi` 写 token/userInfo/routeList → 跳 `/home` |
| `home/index.tsx` | 首页（静态欢迎图） |
| `profile/index.tsx` | 个人资料：修改信息、改密码、上传头像 |
| `sys-user/index.tsx` | 用户管理：左部门树 + 用户 ProTable；新增/编辑/删除/重置密码/状态开关/导出 |
| `sys-dept/index.tsx` | 部门管理（树形 CRUD + 导出） |
| `sys-dicttype/index.tsx` | 字典类型管理（CRUD + 导出） |
| `sys-dictdata/index.tsx` | 字典数据管理（按字典类型，CRUD + 导出） |
| `sys-post/index.tsx` | 岗位管理（CRUD + 导出） |
| `sys-role/index.tsx` | 角色管理（CRUD、状态、数据权限范围分配） |
| `sys-menu/index.tsx` | 菜单管理（动态路由/菜单/按钮 CRUD，FormDrawer 编辑） |
| `sys-api/index.tsx` | API 接口管理（同步后端接口 + CRUD） |
| `sys-config/index.tsx` | 系统参数配置（CRUD + 导出） |
| `sys-loginlog/index.tsx` | 登录日志（只读 + 删除/导出） |
| `sys-operlog/index.tsx` | 操作日志（只读 + 删除/导出） |
| `sys-tools/sys-monitor/index.tsx` | 服务器监控（CPU/内存/磁盘/OS，echarts + liquidfill） |
| `sys-tools/sys-gen/index.tsx` | 代码生成：表管理、从数据库导入表、生成菜单/代码、预览、下载 zip |
| `sys-tools/sys-gen/edit/index.tsx` | 生成配置编辑（基本信息/字段信息/生成信息 三 Tab，EditableProTable） |

### 2.2 App 端用户 `views/app/user/`

| 页面 | 说明 |
| --- | --- |
| `user/index.tsx` | App 端用户管理（CRUD + 导出） |
| `user-conf/index.tsx` | 用户配置记录（登录权限等，CRUD + 导出） |
| `user-level/index.tsx` | 用户等级管理（CRUD + 导出） |
| `user-country-code/index.tsx` | 国家区号管理（CRUD + 导出） |
| `user-oper-log/index.tsx` | App 用户操作日志（只读） |
| `user-account-log/index.tsx` | 账户变动（余额）日志（只读） |

### 2.3 插件域 `views/plugins/`

| 页面 | 说明 |
| --- | --- |
| `msg/msg-code/index.tsx` | 短信/验证码记录（CRUD + 导出） |
| `content/content-article/index.tsx` | 内容文章管理（CRUD + 导出，富文本编辑） |
| `content/content-category/index.tsx` | 内容分类管理（CRUD + 导出） |
| `content/content-announcement/index.tsx` | 公告管理（CRUD + 导出） |
| `filemgr/filemgr-app/index.tsx` | App 文件/安装包管理（CRUD + 上传 + 导出） |

### 2.4 小说平台 `views/app/novel/`（2026-08-07 新增）

| 页面 | 说明 |
| --- | --- |
| `novel-notice/index.tsx` + `components/FormModal.tsx` | 系统公告管理：分页（标题关键字搜索）、发布公告弹窗（标题≤100、内容≤2000 TextArea）、行删除（级联删除读者端通知） |
| `novel-feedback/index.tsx` | 反馈/投诉管理：分页（类型 A~H、类别 feedback/complaint、内容关键字、时间范围筛选）、行删除 |
| `novel-user/index.tsx` + `components/BanPostModal.tsx` | 读者管理：分页（用户名/昵称关键字、账户状态筛选）；账户状态开关（`app:novel-user:status`，禁用后该用户 token 立即失效）；禁言状态列（截止时间 + 原因 Tooltip）；禁止发帖/解除禁言弹窗（`app:novel-user:ban-post`，DatePicker 选截止时间，不选提交即解除） |
| `novel-post/index.tsx` | 话题管理：分页（标题关键字、状态筛选），展示字数/点赞/评论/收藏；操作列禁止访问/恢复（`app:novel-post:status`，二次确认，禁止后读者端不再展示） |

> 每个页面同目录下一般有 `components/`（FormModal、选择弹窗等），命名与页面一一对应。

## 3. API 模块清单（`src/api/`）

> 下表省略重复的 `/admin-api/v1` 前缀；“标准 CRUD”表示遵守 §1.2 的 6 个约定接口（分页/详情/新增/修改/删除/导出），路径为模块 base。

### 3.1 系统管理 `api/admin/sys/`

**sys-user**（base `/admin/sys/sys-user`）
| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `loginApi` | POST `/login` | 登录，password 前端 md5 |
| `getCaptchaApi` | GET `/captcha` | 图形验证码（返回 base64 + id） |
| `logoutApi` | GET `/admin/sys/sys-user/logout` | 退出 |
| `getUserProfileApi` | GET `/admin/sys/sys-user/profile` | 当前用户信息 |
| `updateProfilePwdApi` | PUT `/admin/sys/sys-user/profile/pwd` | 改密（md5） |
| `updateProfileInfoApi` | PUT `/admin/sys/sys-user/profile` | 更新资料 |
| `updateProfileAvatar` | POST `/admin/sys/sys-user/profile/avatar` | 上传头像（FormData） |
| `getUserPageApi` 等 | 标准 CRUD（base 如上） | 用户分页/详情/增改删 |
| `exportUserApi` | GET `/admin/sys/sys-user/export` | 导出 |
| `changeUserPwdApi` | PUT `/admin/sys/sys-user/pwd-reset` | 重置密码 |
| `changeUserStatusApi` | PUT `/admin/sys/sys-user/update-status` | 启用/禁用 |

**sys-dept**（base `/admin/sys/sys-dept`）
| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `getDeptTreeApi` | GET `/admin/sys/sys-dept/dept-tree` | 部门树 |
| `roleDeptTreeselectApi` | GET `/admin/sys/sys-dept/role-dept-tree-select/{roleId}` | 角色数据权限部门树（含勾选态） |
| 其余 | 标准 CRUD | - |

**sys-dicttype**（base `/admin/sys/sys-dict/type`）
- 标准 CRUD；`getAllDictTypesApi` GET `/option-select` 获取全部类型下拉。

**sys-dictdata**（base `/admin/sys/sys-dict/data`）
- 标准 CRUD（分页支持 `dictType` 过滤）；`getDictsApi` GET `/select?dictType=` 获取某类型字典下拉；`getDictOptions` 为纯工具函数（构建 `Map<dictValue,dictLabel>`）。

**sys-post**（base `/admin/sys/sys-post`）
- 标准 CRUD；`getPostTotalListApi` GET `/list` 全量岗位（下拉）。

**sys-role**（base `/admin/sys/sys-role`）
- 标准 CRUD；`getRoleTotalListApi` GET `/list`；`dataScopeApi` PUT `/role-data-scope`；`changeRoleStatusApi` PUT `/role-status`。

**sys-menu**（base `/admin/sys/sys-menu`）
- 标准 CRUD；`getMenuRoleApi` GET `/menu-role`（**登录后拉取当前用户动态路由**）；`roleMenuTreeselectApi` GET `/role-menu-tree-select/{id}`（角色授权时菜单树 + 勾选键）。

**sys-api**（base `/admin/sys/sys-api`）
- 标准 CRUD；`getApiListApi` GET `/list`；`syncApiApi` GET `/sync`（同步后端接口）。

**sys-config**（base `/admin/sys/sys-config`）
- 标准 CRUD；`getConfigByKey` GET `/{key}`。

**sys-loginlog**（base `/admin/sys/sys-login-log`）
- 标准 CRUD（页面只读）。

**sys-operlog**（base `/admin/sys/sys-oper-log`）
- 标准 CRUD（页面只读，无详情/新增）。

**sys-tools/sys-monitor**（base `/admin/sys/sys-monitor`）
- `getMonitorApi` GET `/`（监控数据）；`getMonitorPingApi` GET `/ping`。

**sys-tools/sys-gen**（base `/admin/sys/sys-table`）
| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `getGenTablePageApi` | GET `/` | 已生成表分页 |
| `delGenTableApi` | DELETE `/`（{ids}） | 删除 |
| `getGenTableDetailApi` | GET `/{id}` | 生成配置详情 |
| `updateGenTableApi` | PUT `/{id}` | 更新生成配置 |
| `getDBTablePageApi` | GET `/db-tables` | 数据库表分页 |
| `importDBTableApi` | POST `/`（{dbTableNames}） | 导入表 |
| `genMenuApi` | GET `/gen/db/{id}` | 生成菜单 |
| `genCodeApi` | GET `/gen/{id}` | 生成代码 |
| `downloadCodeApi` | GET `/gen/download/{id}` | 下载代码 zip |
| `previewTableApi` | GET `/preview/{id}` | 代码预览 |

### 3.2 App 端用户 `api/app/user/`

- **user**（base `/app/user/user`）：标准 CRUD。
- **user-conf**（base `/app/user/user-conf`）：标准 CRUD。
- **user-level**（base `/app/user/user-level`）：标准 CRUD。
- **user-country-code**（base `/app/user/user-country-code`）：标准 CRUD。
- **user-oper-log**（base `/app/user/user-oper-log`）：标准 CRUD（只读）。
- **user-account-log**（base `/app/user/user-account-log`）：标准 CRUD（只读）。

### 3.3 插件域 `api/plugins/`

- **msg/msg-code**（base `/plugins/msg/msg-code`）：标准 CRUD。
- **content/content-category**（base `/plugins/content/content-category`）：标准 CRUD。
- **content/content-article**（base `/plugins/content/content-article`）：标准 CRUD。
- **content/content-announcement**（base `/plugins/content/content-announcement`）：标准 CRUD。
- **filemgr/filemgr-app**（base `/plugins/filemgr/filemgr-app`）：标准 CRUD；另有 `exportUploadFileAppApi` POST `/upload`（multipart，适配 rc-upload）。

### 3.4 小说平台 `api/app/novel/`（2026-08-07 新增）

- **novel-notice**（base `/app/novel/notice`）：

| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `getNovelNoticePageApi` | GET `/` | 公告分页，query `keyword`（标题包含搜索） |
| `addNovelNoticeApi` | POST `/` | 发布公告，body `{title≤100, content≤2000}`，广播到全部读者 |
| `delNovelNoticeApi` | DELETE `/`（{ids}） | 删除公告，级联删除读者端通知 |

- **novel-feedback**（base `/app/novel/feedback`）：

| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `getNovelFeedbackPageApi` | GET `/` | 反馈/投诉分页，query `kind=feedback\|complaint`、`type=A~H`、`keyword`（内容包含搜索） |
| `delNovelFeedbackApi` | DELETE `/`（{ids}） | 删除反馈/投诉 |

- **novel-user**（base `/app/novel/user`）：

| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `getNovelUserPageApi` | GET `/` | 读者分页（left join app_user），query `keyword`（用户名/昵称包含搜索）、`status`（1-正常 2-禁用） |
| `changeNovelUserStatusApi` | PUT `/{id}/status` | 启用/禁用账户，body `{status: "1"\|"2"}`；禁用后 jwtauth 实时拒绝该读者请求 |
| `banNovelUserPostApi` | PUT `/{id}/ban-post` | 禁止发帖，body `{banUntil: RFC3339 或 null, reason≤255}`；banUntil 为空则解除禁言 |

- **novel-post**（base `/app/novel/post`）：

| 函数 | 路径/方法 | 说明 |
| --- | --- | --- |
| `getNovelPostPageApi` | GET `/` | 话题分页（全部状态），query `keyword`（标题包含搜索）、`status`（1-正常 2-禁止访问） |
| `changeNovelPostStatusApi` | PUT `/{id}/status` | 禁止访问/恢复，body `{status: "1"\|"2"}`；禁止后读者端列表与详情均不可见 |

## 4. 核心领域类型（在对应 api 文件中定义）

| 类型 | 文件 | 说明 |
| --- | --- | --- |
| `RouteObjectType` | `api/admin/sys/sys-menu/index.ts` | 动态路由/菜单项类型（扩展 react-router `RouteObject`：`title/icon/redirect/permission/menuType/isKeepAlive/isAffix/isHidden/isFrame/parentId/children`） |
| `MenuModel` / `MenuTreeRole` | 同上 | 菜单模型 / 角色授权树 |
| `ReqLogin` / `RespLogin` / `Captcha` / `LoginUserInfo` / `UserModel` | `api/admin/sys/sys-user/index.ts` | 登录相关；`UserModel` 内嵌 `dept`、`role`、`post` |
| `PassWdChange` / `UserInfoChange` | 同上 | 改密 / 资料 |
| App 端 `UserModel` 等 | `api/app/user/user/index.ts` | App 用户（内嵌 `userLevel`） |
| `ResPage<T>` / `ResultData<T>` | `utils/request/interface/index.ts` | 统一返回包装 |

## 5. 登录流程时序（`LoginForm.tsx`）

```
进入登录页 ─▶ getCaptchaApi() 加载图形验证码
用户提交 ─▶ loginApi({username, password: md5, code, uuid})
   ├─ code!==200 → message.error(msg)
   └─ 成功：setToken(token)
       ─▶ getUserProfileApi() → setUserInfo(userInfo)
       ─▶ getMenuRoleApi()   → setRouteList(routeList)  # 触发动态路由注册
       ─▶ message.success → navigate(HOME_URL)
finally：刷新验证码、结束 LoadingButton
```
