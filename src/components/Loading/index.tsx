import { Spin } from "antd";
import "./index.less";

const Loading = ({ tip = "Loading" }: { tip?: string }) => {
	return <Spin spinning tip={tip} size="large" fullscreen className="request-loading" />;
};

export default Loading;
