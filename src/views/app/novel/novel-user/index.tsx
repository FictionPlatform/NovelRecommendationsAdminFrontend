import {
  changeNovelUserStatusApi,
  getNovelUserPageApi,
  NovelUserModel
} from "@/api/app/novel/novel-user";
import HocAuth from "@/components/HocAuth";
import LoadingButton from "@/components/LoadingButton";
import SwitchLoading from "@/components/LoadingSwitch";
import { pagination } from "@/config/proTable";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { formatDataForProTable } from "@/utils";
import { BlockOutlined, UnlockOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns, ProFormInstance } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Badge, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import React, { useRef } from "react";
import BanPostModal, { BanPostModalRef } from "./components/BanPostModal";

const STATUS_YES = "1";

const NovelUser: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();
  const banPostModalRef = useRef<BanPostModalRef>(null);

  // 定义列
  const columns: ProColumns<NovelUserModel>[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 50,
      align: "center",
      className: "gray-cell",
      render: (_, __, index, action) => {
        // 根据分页计算实际序号
        const currentPage = action?.pageInfo?.current || 1;
        const pageSize = action?.pageInfo?.pageSize || 10;
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: "用户编号",
      dataIndex: "userId",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "用户名",
      dataIndex: "userName",
      width: 120,
      align: "left",
      ellipsis: true
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      hideInSearch: true,
      width: 120,
      align: "left",
      ellipsis: true
    },
    {
      title: "手机号",
      dataIndex: "mobile",
      hideInSearch: true,
      width: 130,
      align: "left"
    },
    {
      title: "用户名/昵称关键字",
      dataIndex: "keyword",
      hideInTable: true,
      width: 160
    },
    {
      title: "账户状态",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        "1": { text: "正常" },
        "2": { text: "禁用" }
      },
      width: 90,
      align: "center",
      render: (_, record) => (
        <HocAuth permission={["app:novel-user:status"]}>
          <SwitchLoading
            checked={record.status === STATUS_YES}
            checkedChildren="正常"
            unCheckedChildren="禁用"
            onChange={checked => handleStatusChange(checked, record)}
          />
        </HocAuth>
      )
    },
    {
      title: "禁言状态",
      dataIndex: "banPostUntil",
      hideInSearch: true,
      width: 200,
      align: "left",
      render: (_, record) =>
        record.banPostUntil ? (
          <Tooltip title={record.banReason ? `原因：${record.banReason}` : "未填写禁言原因"}>
            <Tag color="red">禁言至 {dayjs(record.banPostUntil).format("YYYY-MM-DD HH:mm")}</Tag>
          </Tooltip>
        ) : (
          <Badge status="success" text="未禁言" />
        )
    },
    {
      title: "注册时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      valueType: "dateTime",
      width: 180,
      align: "left"
    },
    {
      title: "操作",
      valueType: "option",
      align: "center",
      fixed: "right",
      width: 120,
      render: (_, data) => (
        <Space>
          <HocAuth permission={["app:novel-user:ban-post"]}>
            <LoadingButton
              key="ban-post"
              type="link"
              size="small"
              danger={!data.banPostUntil}
              icon={data.banPostUntil ? <UnlockOutlined /> : <BlockOutlined />}
              onClick={done => {
                banPostModalRef.current?.showBanPostModal(data);
                setTimeout(() => done(), 1000);
              }}
            >
              {data.banPostUntil ? "解除禁言" : "禁止发帖"}
            </LoadingButton>
          </HocAuth>
        </Space>
      )
    }
  ];

  const handleStatusChange = async (checked: boolean, record: NovelUserModel) => {
    const { code, msg } = await changeNovelUserStatusApi(record.userId!, checked ? "1" : "2");
    if (code !== ResultEnum.SUCCESS) {
      message.error(msg);
      actionRef.current?.reload(false);
      return;
    }
    message.success(msg);
    actionRef.current?.reload(false);
  };

  const handleBanPostModalConfirm = () => {
    actionRef.current?.reload(false);
  };

  return (
    <>
      <ProTable<NovelUserModel>
        className="ant-pro-table-scroll"
        columns={columns}
        actionRef={actionRef}
        formRef={tableFormRef}
        bordered
        cardBordered
        defaultSize="small"
        scroll={{ x: "1400", y: "100%" }}
        request={async params => {
          const { data } = await getNovelUserPageApi(params);
          return formatDataForProTable<NovelUserModel>(data);
        }}
        columnsState={{
          persistenceKey: "use-pro-table-key-novel-user",
          persistenceType: "localStorage"
        }}
        options={{
          reload: true,
          density: false,
          fullScreen: true
        }}
        rowKey="userId"
        search={{ labelWidth: "auto", showHiddenNum: true }}
        pagination={pagination}
        dateFormatter="string"
        headerTitle="读者管理"
      />
      <BanPostModal ref={banPostModalRef} onConfirm={handleBanPostModalConfirm} />
    </>
  );
};

export default NovelUser;
