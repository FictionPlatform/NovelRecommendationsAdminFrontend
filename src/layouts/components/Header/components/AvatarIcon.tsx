import { LoginUserInfo } from "@/api/admin/sys/sys-user";
import { PROFILE_URL } from "@/config";
import { store } from "@/redux";
import { resetGlobal } from "@/redux/modules/global/action";
import { setMenuList } from "@/redux/modules/menu/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, message, Modal } from "antd";
import { useRef } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import InfoModal from "./InfoModal";
import PasswordModal from "./PasswordModal";

const AvatarIcon = (props: any) => {
	const { resetGlobal } = props;
	const navigate = useNavigate();
	const uInfo: LoginUserInfo = store.getState().global.userInfo;

	interface ModalProps {
		showModal: (params: { name: number }) => void;
	}
	const passRef = useRef<ModalProps>(null);
	const infoRef = useRef<ModalProps>(null);

	// 退出登录
	const logout = () => {
		Modal.confirm({
			title: "温馨提示 🧡",
			icon: <ExclamationCircleOutlined />,
			content: "是否确认退出登录？",
			okText: "确认",
			cancelText: "取消",
			onOk: () => {
				resetGlobal();
				store.dispatch(setTabsList([]));
				store.dispatch(setMenuList([]));
				message.success("退出登录成功！");
				navigate("/login");
			}
		});
	};

	// Dropdown Menu
	const menu = (
		<Menu
			items={[
				{
					key: "1",
					label: <span className="dropdown-item">个人信息</span>,
					icon: <UserOutlined />,
					//onClick: () => infoRef.current?.showModal({ name: "hooks" })
					onClick: () => {
						navigate(PROFILE_URL);
					}
				},
				{
					type: "divider"
				},
				{
					key: "2",
					label: <span className="dropdown-item">退出登录</span>,
					onClick: logout
				}
			]}
		></Menu>
	);
	return (
		<>
			<Dropdown overlay={menu} placement="bottom" arrow trigger={["click"]}>
				<Avatar size="large" src={uInfo?.avatar} />
			</Dropdown>
			<InfoModal innerRef={infoRef}></InfoModal>
			<PasswordModal innerRef={passRef}></PasswordModal>
		</>
	);
};

const mapDispatchToProps = { resetGlobal };
export default connect(null, mapDispatchToProps)(AvatarIcon);
