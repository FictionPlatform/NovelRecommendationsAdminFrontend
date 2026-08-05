import { getMenuRoleApi } from "@/api/admin/sys/sys-menu";
import { getCaptchaApi, getUserProfileApi, loginApi } from "@/api/admin/sys/sys-user";
import { getAllDictTypeWithDataApi } from "@/api/admin/sys/sys-dicttype";
import LoadingButton from "@/components/LoadingButton";
import { HOME_URL } from "@/config";
import { ResultEnum } from "@/enums/httpEnum";
import { setDictList, setRouteList, setToken, setUserInfo } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { CloseCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const LoginForm = (props: any) => {
	const { t } = useTranslation();
	const { setToken, setRouteList, setUserInfo, setTabsList, setDictList } = props;
	const [form] = Form.useForm();
	const [captchaInfo, setCaptchaInfo] = useState("");
	const [captchaId, setCaptchaId] = useState("");
	const navigate = useNavigate();

	const onCaptcha = async () => {
		const { data, msg, code } = await getCaptchaApi();
		if (code !== ResultEnum.SUCCESS) {
			message.error(msg);
			return;
		}
		setCaptchaInfo(data.data);
		setCaptchaId(data.id);
	};

	const onLogin = (done: () => void) => {
		form
			.validateFields()
			.then(async values => {
				try {
					setTabsList([]);
					message.open({ key: "loading", type: "loading", content: "登录中..." });
					// values = { ...values, password: md5(values.password), uuid: captchaId };
					values = { ...values, uuid: captchaId };
					const { data, msg, code } = await loginApi(values);
					if (code !== ResultEnum.SUCCESS) {
						message.error(msg);
						return;
					}
					setToken(data.token);
					const { data: userInfo, code: userCode, msg: userMsg } = await getUserProfileApi();
					if (userCode !== ResultEnum.SUCCESS) {
						message.error(userMsg);
						return;
					}
					const { data: routeList, code: routeCode, msg: routeMsg } = await getMenuRoleApi();
					if (routeCode !== ResultEnum.SUCCESS) {
						message.error(routeMsg);
						return;
					}

					const { data: dictList, code: dictCode, msg: dictMsg } = await getAllDictTypeWithDataApi();
					if (dictCode !== ResultEnum.SUCCESS) {
						message.error(dictMsg);
						return;
					}
					

					setUserInfo(userInfo);
					setRouteList(routeList);
					setDictList(dictList);

					message.success("登录成功！");
					navigate(HOME_URL);
				} finally {
					onCaptcha();
					done();
					message.destroy("loading");
				}
			})
			.catch((error) => {
				onCaptcha();
				// 1. 判断是否是请求被取消的错误
				if (axios.isCancel(error)) {
					console.log('请求被取消:', error.message);
					// 这里通常不需要提示用户，或者提示“登录已取消”
					return;
				}
				// 2. 判断是否是表单校验错误
				else if (error.errorFields) {
					console.log('表单校验失败:', error);
					message.error("表单校验失败");
				}
				// 3. 其他异常（如网络错误、代码报错）
				else {
					console.error('登录过程发生未知错误:', error);
					message.error("登录失败，请重试");
				}
				done();
			});
	};

	useEffect(() => {
		onCaptcha();
	}, []);

	return (
		<div className="login-form-content">
			<Form form={form} name="basic" initialValues={{ username: "admin", password: "123456" }} size="large" autoComplete="off">
				<Form.Item name="username" rules={[{ required: true, message: "请输入用户名!" }]}>
					<Input prefix={<UserOutlined />} placeholder="用户名: admin / test" />
				</Form.Item>
				<Form.Item name="password" rules={[{ required: true, message: "请输入密码!" }]}>
					<Input.Password prefix={<LockOutlined />} placeholder="密码：123456" />
				</Form.Item>
				<Form.Item name="code" rules={[{ required: true, message: "请输入验证码!" }]}>
					<div className="login-form-captcha-input-group">
						<Input placeholder="验证码:" />
						<img src={captchaInfo} className="login-form-captcha-img" onClick={onCaptcha} />
					</div>
				</Form.Item>
				<Form.Item className="login-btn">
					<LoadingButton
						onClick={done => {
							form.resetFields();
							setTimeout(() => done(), 1000);
						}}
						icon={<CloseCircleOutlined />}
					>
						{t("login.reset")}
					</LoadingButton>
					<LoadingButton type="primary" onClick={done => onLogin(done)} htmlType="submit" icon={<UserOutlined />}>
						{t("login.confirm")}
					</LoadingButton>
				</Form.Item>
			</Form>
		</div>
	);
};

const mapDispatchToProps = { setToken, setUserInfo, setRouteList, setTabsList, setDictList };
export default connect(null, mapDispatchToProps)(LoginForm);
