import { updateCollapse } from "@/redux/modules/menu/action";
import { RouteObjectType } from "@/api/admin/sys/sys-menu";
import { SysStatus } from "@/enums/base";
import { store } from "@/redux";
import { searchRoute } from "@/utils/util";
import { Layout } from "antd";
import { useEffect, useRef } from "react";
import KeepAlive from "react-activation";
import { connect } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import LayoutFooter from "./components/Footer";
import LayoutHeader from "./components/Header";
import LayoutMenu from "./components/Menu";
import LayoutTabs from "./components/Tabs";
import "./index.less";

const LayoutIndex = (props: any) => {
	const { Sider, Content } = Layout;
	const { isCollapse, updateCollapse } = props;
	const { pathname } = useLocation();

	// 按后端下发的 isKeepAlive 决定是否缓存当前页（1=缓存 2=不缓存）
	const rList: RouteObjectType[] = store.getState().global.routeList;
	const keepAlive = searchRoute(pathname, rList)?.isKeepAlive === SysStatus.TRUE;

	// 监听窗口大小变化：窗口放大自动展开、缩小自动折叠；用 ref 取最新折叠状态，避免闭包过期
	const isCollapseRef = useRef(isCollapse);
	isCollapseRef.current = isCollapse;

	useEffect(() => {
		const handleResize = () => {
			const screenWidth = document.body.clientWidth;
			const collapsed = isCollapseRef.current;
			if (collapsed && screenWidth > 1200) updateCollapse(false);
			else if (!collapsed && screenWidth < 1200) updateCollapse(true);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [updateCollapse]);

	return (
		// 这里不用 Layout 组件原因是切换页面时样式会先错乱然后在正常显示，造成页面闪屏效果
		<section className="container">
			<Sider trigger={null} collapsed={props.isCollapse} width={220} theme="dark">
				<LayoutMenu></LayoutMenu>
			</Sider>
			<Layout>
				<LayoutHeader></LayoutHeader>
				<LayoutTabs></LayoutTabs>
				<KeepAlive name={pathname} when={keepAlive}>
					<Content>
						<Outlet></Outlet>
					</Content>
				</KeepAlive>
				<LayoutFooter></LayoutFooter>
			</Layout>
		</section>
	);
};

const mapStateToProps = (state: any) => state.menu;
const mapDispatchToProps = { updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutIndex);
