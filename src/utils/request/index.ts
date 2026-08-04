import NProgress from "@/config/nprogress";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/config/serviceLoading";
import { ResultEnum } from "@/enums/httpEnum";
import { store } from "@/redux";
import { resetGlobal } from "@/redux/modules/global/action";
import { setMenuList } from "@/redux/modules/menu/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { message } from "antd";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosCanceler } from "./helper/axiosCancel";
import { checkStatus } from "./helper/checkStatus";
import { ResultData } from "./interface";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	loading?: boolean;
}

// * 登出/登录失效：清空会话数据（token/userInfo/routeList）及派生的 tabs/menu，避免旧数据残留
export const resetSession = () => {
	store.dispatch(resetGlobal());
	store.dispatch(setTabsList([]));
	store.dispatch(setMenuList([]));
};

const config = {
	// 默认地址请求地址，可在 .env 开头文件中修改
	baseURL: import.meta.env.VITE_API_URL as string,
	// 设置超时时间（10s）
	timeout: 90000,
	// 跨域时候允许携带凭证
	withCredentials: false
};

class RequestHttp {
	service: AxiosInstance;
	axiosCanceler: AxiosCanceler;
	public constructor(config: AxiosRequestConfig) {
		// 实例化axios
		this.service = axios.create(config);
		this.axiosCanceler = new AxiosCanceler();

		/**
		 * @description 请求拦截器
		 * 客户端发送请求 -> [请求拦截器] -> 服务器
		 * token校验(JWT) : 接受服务器返回的token,存储到redux/本地储存当中
		 */
		this.service.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				// * 记录当前请求，重复发起相同请求时取消前一个（配合路由切换时的 removeAllPending）
				this.axiosCanceler.addPending(config);
				NProgress.start();
				// * 如果当前请求不需要显示 loading,在api服务中通过指定的第三个参数: { headers: { noLoading: true } }来控制不显示loading，参见loginApi
				config.headers!.noLoading || showFullScreenLoading();
				const token: string = store.getState().global.token;

				if (config.headers && typeof config.headers.set === "function" && token !== undefined) {
					config.headers.set("Authorization", "Bearer " + token);
				}
				return config;
			},
			(error: AxiosError) => {
				return Promise.reject(error);
			}
		);

		/**
		 * @description 响应拦截器
		 *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
		 */
		this.service.interceptors.response.use(
			(response: AxiosResponse) => {
				const { data, config } = response;
				NProgress.done();
				// * 在请求结束后，移除本次请求(关闭loading)
				tryHideFullScreenLoading();
				// * 请求结束后从 pending 中移除，允许后续重复请求
				this.axiosCanceler.removePending(config);
				// * 登录失效（code == 599）
				if (data.code == ResultEnum.OVERDUE) {
					resetSession();
					message.error(data.msg);
					window.location.hash = "/login";
					return Promise.reject(data);
				}
				if (data.code == ResultEnum.UNAUTH) {
					message.error(data.msg);
					return Promise.reject(data);
				}
				return data;
			},
			async (error: AxiosError) => {
				const { response } = error;
				NProgress.done();
				tryHideFullScreenLoading();
				// * 失败/取消的请求也从 pending 中移除
				error.config && this.axiosCanceler.removePending(error.config);
				// 请求超时单独判断，请求超时没有 response
				if (error.message.indexOf("timeout") !== -1) message.error("请求超时，请稍后再试");
				// 根据响应的错误状态码，做不同的处理
				if (response) checkStatus(response.status);
				// 服务器结果都没有返回(可能服务器错误可能客户端断网) 断网处理:可以跳转到断网页面
				if (!window.navigator.onLine) window.location.hash = "/500";
				return Promise.reject(error);
			}
		);
	}

	// * 常用请求方法封装
	get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
		return this.service.get(url, { params, ..._object });
	}
	post<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
		return this.service.post(url, params, _object);
	}
	put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
		return this.service.put(url, params, _object);
	}
	delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
		return this.service.delete(url, { data: params, ..._object });
	}
	download(url: string, params?: object, _object = {}): Promise<BlobPart> {
		return this.service.get(url, { params, ..._object, responseType: "blob" });
	}
}

export default new RequestHttp(config);
