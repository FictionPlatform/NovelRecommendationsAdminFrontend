import { HOME_URL, LOGIN_URL } from "@/config";
import { store } from "@/redux/index";
import { AxiosCanceler } from "@/utils/request/helper/axiosCancel";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const axiosCanceler = new AxiosCanceler();

// 不参与菜单权限校验的固定页面
const AUTH_WHITE_LIST = ["/", LOGIN_URL, "/403", "/404", "/500", HOME_URL];

/**
 * @description 路由守卫组件
 * */
const AuthRouter = (props: { children: JSX.Element }) => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const token = store.getState().global.token;
	// 当前账号允许访问的路由扁平数组（由菜单列表计算得出，含隐藏页）
	const authRouter: string[] = store.getState().auth.authRouter;

	useEffect(() => {
		axiosCanceler.removeAllPending();
		const update = async () => {
			if (!token) {
				return navigate(LOGIN_URL);
			}
			if (token && pathname === LOGIN_URL) {
				return navigate(HOME_URL);
			}

			if (!token && pathname !== LOGIN_URL) {
				return navigate(LOGIN_URL, { replace: true });
			}

			// 深度链接/未授权路径拦截：权限路由列表已就绪、当前路径不在白名单也不在权限列表内时跳 403
			if (authRouter.length > 0 && !authRouter.includes(pathname) && !AUTH_WHITE_LIST.includes(pathname)) {
				return navigate("/403", { replace: true });
			}
		};
		update();
	}, [token, pathname, authRouter]);
	// * 当前账号有权限返回 Router，正常访问页面
	return props.children;
};

export default AuthRouter;
