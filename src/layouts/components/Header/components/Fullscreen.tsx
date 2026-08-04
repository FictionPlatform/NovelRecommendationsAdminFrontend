import screenfull from "screenfull";
import { message } from "antd";
import { useEffect, useState } from "react";

const Fullscreen = () => {
	const [fullScreen, setFullScreen] = useState<boolean>(screenfull.isFullscreen);

	useEffect(() => {
		const handleChange = () => {
			setFullScreen(screenfull.isFullscreen);
		};
		screenfull.on("change", handleChange);
		return () => {
			screenfull.off("change", handleChange);
		};
	}, []);

	const handleFullScreen = () => {
		if (!screenfull.isEnabled) message.warning("当前您的浏览器不支持全屏 ❌");
		screenfull.toggle();
	};
	return (
		<i className={["icon-style iconfont", fullScreen ? "icon-suoxiao" : "icon-fangda"].join(" ")} onClick={handleFullScreen}></i>
	);
};
export default Fullscreen;
