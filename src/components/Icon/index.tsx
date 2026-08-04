import * as Icons from "@ant-design/icons";
import { createFromIconfontCN } from "@ant-design/icons";
import React from "react";

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = React.memo(({ name, className }) => {
  const customIcons: { [key: string]: any } = Icons;
  if (!name) return null;
  const iconType = customIcons[name];
  // 兜底：图标名在后端下发/本地不存在时返回 null，避免 createElement(undefined) 渲染崩溃
  if (!iconType) return null;
  return React.createElement(iconType, { className });
});

export const IconFont = createFromIconfontCN({
  scriptUrl: ["//at.alicdn.com/t/c/font_3878708_l04g6iwc6y.js"]
});
