import "@/assets/fonts/font.less";
import "@/assets/iconfont/iconfont.less";
import "@/styles/reset.less";
// import ReactDOM from "react-dom";
// import "antd/dist/antd.less";
import App from "@/App";
import "@/language/index";
import { persistor, store } from "@/redux";
import "@/styles/common.less";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import React from 'react';
import ReactDOM from "react-dom/client";
// react 18 创建（会导致 antd 菜单折叠时闪烁，等待官方修复）
ReactDOM.createRoot(document.getElementById("root")!).render(
	// * react严格模式
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</React.StrictMode>
);
