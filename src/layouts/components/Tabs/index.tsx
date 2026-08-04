import { RouteObjectType } from "@/api/admin/sys/sys-menu";
import { HOME_URL } from "@/config";
import { store } from "@/redux";
import { setTabsList } from "@/redux/modules/tabs/action";
import { searchRoute } from "@/utils/util";
import { HomeFilled } from "@ant-design/icons";
import { Tabs } from "antd";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import MoreButton from "./components/MoreButton";
import "./index.less";

const LayoutTabs = (props: any) => {
	const { tabsList } = props.tabs;
	const { themeConfig } = props.global;
	const { setTabsList } = props;
	const { TabPane } = Tabs;
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const [activeValue, setActiveValue] = useState<string>(pathname);
	const rList: RouteObjectType[] = store.getState().global.routeList;

	useEffect(() => {
		addTabs();
	}, [pathname]);

	// click tabs
	const clickTabs = (path: string) => {
		navigate(path);
	};

	// add tabs
	const addTabs = () => {
		const route = searchRoute(pathname, rList);
		const path = route.path;
		const title = route.title;
		// 未知/错误页路由（login、403/404/500 等）不在菜单列表中，不插入标签页
		if (!path || !title) {
			setActiveValue(pathname);
			return;
		}
		let newTabsList = JSON.parse(JSON.stringify(tabsList));
		if (tabsList.every((item: any) => item.path !== path)) {
			newTabsList.push({ title, path });
		}
		setTabsList(newTabsList);
		setActiveValue(pathname);
	};

	// delete tabs
	const delTabs = (tabPath?: string) => {
		if (tabPath === HOME_URL) return;
		if (pathname === tabPath) {
			tabsList.forEach((item: Menu.MenuOptions, index: number) => {
				if (item.path !== pathname) return;
				const nextTab = tabsList[index + 1] || tabsList[index - 1];
				if (!nextTab) return;
				navigate(nextTab.path);
			});
		}
		//message.success("你删除了Tabs标签 😆😆😆");
		setTabsList(tabsList.filter((item: Menu.MenuOptions) => item.path !== tabPath));
	};

	const tabPaneItems = tabsList.map((item: Menu.MenuOptions) => ({
		key: item.path,
		label: (
			<span>
				{item.path == HOME_URL ? <HomeFilled /> : null}
				{item.title}
			</span>
		),
		closable: item.path !== HOME_URL,
		// 如果你在原来的 <TabPane> 标签内部写了其他子组件，
		// 请将它们赋值给 children 属性，例如：
		// children: <YourComponent />,
	}));

	return (
		<>
			{themeConfig.tabs && (
				<div className="tabs" style={{ background: "#fff" }}>
					<Tabs
						animated
						activeKey={activeValue}
						onChange={clickTabs}
						hideAdd
						type="editable-card"
						onEdit={path => {
							delTabs(path as string);
						}}
						items={tabPaneItems}
					>
					</Tabs>
					<MoreButton tabsList={tabsList} delTabs={delTabs} setTabsList={setTabsList}></MoreButton>
				</div>
			)}
		</>
	);
};

const mapStateToProps = (state: any) => state;
const mapDispatchToProps = { setTabsList };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutTabs);
