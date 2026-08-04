import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore, Store } from "redux";
import {
	TypedUseSelectorHook,
	useDispatch as useReduxDispatch,
	useSelector as useReduxSelector
} from "react-redux";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import reduxPromise from "redux-promise";
import reduxThunk from "redux-thunk";
import auth from "./modules/auth/reducer";
import breadcrumb from "./modules/breadcrumb/reducer";
import global from "./modules/global/reducer";
import menu from "./modules/menu/reducer";
import tabs from "./modules/tabs/reducer";

// 创建reducer(拆分reducer)
const reducer = combineReducers({
	global,
	menu,
	tabs,
	auth,
	breadcrumb
});

// 仅把 UI 偏好（语言/组件尺寸/主题）落盘；token、userInfo、routeList 等会话数据不写 localStorage，刷新后需重新登录
const globalUIPersist = createTransform(
	(inboundState: any) => ({
		language: inboundState.language,
		assemblySize: inboundState.assemblySize,
		themeConfig: inboundState.themeConfig
	}),
	(outboundState: any) => outboundState || {},
	{ whitelist: ["global"] }
);

// redux 持久化配置
const persistConfig = {
	key: "redux-state",
	storage: storage,
	// 只持久化 UI 类状态，避免 JWT/用户信息/菜单树明文落盘（防 XSS 窃取）
	whitelist: ["global", "tabs", "menu"],
	transforms: [globalUIPersist]
};
const persistReducerConfig = persistReducer(persistConfig, reducer);

// 开启 redux-devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// 使用 redux 中间件
const middleWares = applyMiddleware(reduxThunk, reduxPromise);

// 创建 store
const store: Store = createStore(persistReducerConfig, composeEnhancers(middleWares));

// 创建持久化 store
const persistor = persistStore(store);

export { persistor, store };
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useDispatch = () => useReduxDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
