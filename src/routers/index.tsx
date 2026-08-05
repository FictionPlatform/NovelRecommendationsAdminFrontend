import { RouteObjectType } from "@/api/admin/sys/sys-menu";
import { SysMenuType, SysStatus } from "@/enums/base";
import useMessage from "@/hooks/useMessage";
import { store } from "@/redux";
import { parseFlatMenuList } from "@/utils/util";
import Login from "@/views/admin/sys/login/index";
import React, { lazy, useMemo } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { LayoutIndex } from "./constant";
import lazyLoad from "./utils/lazyLoad";

export const rootRouter: RouteObjectType[] = [
	{
		path: "/",
		element: <Navigate to="/login" />
	},
	{
		path: "/login",
		element: <Login />,
		title: "登录页"
	},
	{
		path: "/403",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/403"))),
		title: "403页面"
	},
	{
		path: "/404",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/404"))),
		title: "404页面"
	},
	{
		path: "/500",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/500"))),
		title: "500页面"
	},
	{
		// 未匹配任意路由（未授权/未注册路径）时兜底到 404，避免白屏
		path: "*",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/404"))),
		title: "404页面"
	}
];

const Router = () => {
	useMessage();
	// 渲染时直接按 store 中的 routeList 同步计算路由表（useMemo 保持引用稳定），
	// 避免 useEffect 滞后注册导致跳转时先匹配到 "*" 兜底 404、再重建路由表造成页面闪烁
	const rList: RouteObjectType[] = store.getState().global.routeList;
	const routerList = useMemo(
		() => (rList && rList.length > 0 ? [...rootRouter, ...dynamicRouter(rList)] : [...rootRouter]),
		[rList]
	);

	const routes = useRoutes(routerList);
	return routes;
};

const modules = import.meta.glob("@/views/**/*.tsx") as Record<string, Parameters<typeof lazy>[number]>;
// console.log(modules["../views/admin/sys/home/index.tsx"]);

export const dynamicRouter = (mList: RouteObjectType[]) => {
	const list = parseFlatMenuList(mList);
	const handleMenuList = list.map(item => {
		item.children && delete item.children;
		if (item.redirect) item.element = <Navigate to={item.redirect} />;
		if (item.element && typeof item.element === "string") {
			const component = modules["/src/views" + item.element + ".tsx"];
			// 后端下发的 element 未命中本地视图文件时，回退到 404 页面，避免 React.lazy(undefined) 抛错拖垮整棵动态路由
			item.element = component ? lazyLoad(lazy(component)) : lazyLoad(lazy(() => import("@/components/ErrorMessage/404")));
		}
		return item;
	});

	const dynamicRouter: RouteObjectType[] = [{ element: <LayoutIndex />, children: [] }];
	handleMenuList.forEach(item => {
		if (item.isFrame == SysStatus.FALSE && item.menuType == SysMenuType.MENU) dynamicRouter.push(item);
		else if (item.menuType == SysMenuType.MENU || item.menuType == SysMenuType.DIRECT) dynamicRouter[0].children?.push(item);
	});
	return dynamicRouter;
};

export default Router;
