import { RouteObjectType } from "@/api/admin/sys/sys-menu";
import { LoginUserInfo } from "@/api/admin/sys/sys-user";
import { DictTypeWithDataModel } from "@/api/admin/sys/sys-dicttype";
import { ThemeConfigProp } from "@/redux/interface/index";
import * as types from "@/redux/mutation-types";

// * setToken
export const setToken = (token: string) => ({
	type: types.SET_TOKEN,
	token
});

// * 重置会话数据（token/userInfo/routeList），登出/登录失效时使用
export const resetGlobal = () => ({
	type: types.RESET_GLOBAL
});

// * setAssemblySize
export const setAssemblySize = (assemblySize: string) => ({
	type: types.SET_ASSEMBLY_SIZE,
	assemblySize
});

export const setUserInfo = (userInfo: LoginUserInfo) => {
	// 相对路径头像补全为绝对地址；avatar 为空时不拼接，避免拼出 "http://hostundefined"
	if (userInfo.avatar && !userInfo.avatar.startsWith("http")) {
		userInfo.avatar = import.meta.env.VITE_API_URL + userInfo.avatar;
	}

	return {
		type: types.SET_USER_INFO,
		userInfo
	};
};

export const setRouteList = (routeList: RouteObjectType[]) => ({
	type: types.SET_ROUTE_LIST,
	routeList
});

// * setDictList（登录后全量字典：每个元素含 dict_type/dict_name/dictData）
export const setDictList = (dictList: DictTypeWithDataModel[]) => ({
	type: types.SET_DICT_LIST,
	dictList
});

// * setLanguage
export const setLanguage = (language: string) => ({
	type: types.SET_LANGUAGE,
	language
});

// * setThemeConfig
export const setThemeConfig = (themeConfig: ThemeConfigProp) => ({
	type: types.SET_THEME_CONFIG,
	themeConfig
});
