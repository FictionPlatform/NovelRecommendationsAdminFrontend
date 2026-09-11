import {
  delNovelNotificationApi,
  getNovelNotificationPageApi,
  NovelNotificationModel
} from "@/api/app/novel/novel-notification";
import HocAuth from "@/components/HocAuth";
import LoadingButton from "@/components/LoadingButton";
import { pagination } from "@/config/proTable";
import { ResultEnum } from "@/enums/httpEnum";
import { message, modal } from "@/hooks/useMessage";
import { formatDataForProTable } from "@/utils";
import { DeleteOutlined, ExclamationCircleOutlined, SendOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns, ProFormInstance } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Space, Tag } from "antd";
import React, { useRef } from "react";
import SendModal, { SendModalRef } from "./components/SendModal";

// 通知来源文案
const SOURCE_LABELS: Record<string, { text: string; color: string }> = {
  system: { text: "系统", color: "blue" },
  notice: { text: "公告", color: "gold" },
  admin: { text: "后台发送", color: "green" },
  feedback: { text: "反馈", color: "purple" },
  complaint: { text: "投诉", color: "red" }
};

const NovelNotification: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();
  const sendModalRef = useRef<SendModalRef>(null);

  const columns: ProColumns<NovelNotificationModel>[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 50,
      align: "center",
      className: "gray-cell",
      render: (_, __, index, action) => {
        const currentPage = action?.pageInfo?.current || 1;
        const pageSize = action?.pageInfo?.pageSize || 10;
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: "通知编号",
      dataIndex: "id",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 200,
      align: "left",
      ellipsis: true
    },
    {
      title: "标题/内容关键字",
      dataIndex: "keyword",
      hideInTable: true,
      width: 180
    },
    {
      title: "收件用户",
      dataIndex: "userName",
      width: 120,
      align: "left",
      ellipsis: true
    },
    {
      title: "用户ID",
      dataIndex: "userId",
      hideInSearch: true,
      width: 110,
      align: "left"
    },
    {
      title: "内容",
      dataIndex: "content",
      hideInSearch: true,
      width: 300,
      align: "left",
      ellipsis: true
    },
    {
      title: "来源",
      dataIndex: "source",
      hideInSearch: true,
      width: 90,
      align: "center",
      render: (_, data) => {
        const s = SOURCE_LABELS[data.source || ""];
        return s ? <Tag color={s.color}>{s.text}</Tag> : <Tag>{data.source}</Tag>;
      }
    },
    {
      title: "状态",
      dataIndex: "isRead",
      hideInSearch: true,
      width: 80,
      align: "center",
      render: (_, data) => (data.isRead === "1" ? <Tag color="default">已读</Tag> : <Tag color="orange">未读</Tag>)
    },
    {
      title: "创建时间",
      dataIndex: "createdAtStr",
      hideInSearch: true,
      width: 180,
      align: "left"
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      valueType: "dateTimeRange",
      hideInTable: true,
      search: { transform: value => ({ beginCreatedAt: value[0], endCreatedAt: value[1] }) }
    },
    {
      title: "操作",
      valueType: "option",
      align: "center",
      fixed: "right",
      width: 100,
      render: (_, data) => (
        <Space>
          <HocAuth permission={["app:novel-notification:del"]}>
            <LoadingButton
              key="delete"
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={done => handleDelete(data.id!, done)}
            >
              删除
            </LoadingButton>
          </HocAuth>
        </Space>
      )
    }
  ];

  const handleShowSendModal = (done: () => void) => {
    sendModalRef.current?.showSendModal();
    setTimeout(() => done(), 1000);
  };

  const handleFormModalConfirm = () => {
    actionRef.current?.reload(false);
  };

  const handleDelete = (id: number, done: () => void) => {
    modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "是否确认删除编号为 " + id + " 的通知？删除后读者端将无法再查看该通知。",
      okText: "确认",
      cancelText: "取消",
      maskClosable: true,
      onCancel: () => {
        done();
      },
      onOk: async () => {
        try {
          const { code, msg } = await delNovelNotificationApi([id!]);
          if (code !== ResultEnum.SUCCESS) {
            message.error(msg);
            return;
          }
          actionRef.current?.reload(false);
          message.success(msg);
        } finally {
          done();
        }
      }
    });
  };

  const toolBarRender = () => [
    <HocAuth permission={["app:novel-notification:add"]}>
      <LoadingButton type="primary" key="addTable" icon={<SendOutlined />} onClick={done => handleShowSendModal(done)}>
        发送通知
      </LoadingButton>
    </HocAuth>
  ];

  return (
    <>
      <ProTable<NovelNotificationModel>
        className="ant-pro-table-scroll"
        columns={columns}
        actionRef={actionRef}
        formRef={tableFormRef}
        bordered
        cardBordered
        defaultSize="small"
        scroll={{ x: "1600", y: "100%" }}
        request={async params => {
          const { data } = await getNovelNotificationPageApi(params);
          return formatDataForProTable<NovelNotificationModel>(data);
        }}
        columnsState={{
          persistenceKey: "use-pro-table-key-novel-notification",
          persistenceType: "localStorage"
        }}
        options={{
          reload: true,
          density: false,
          fullScreen: true
        }}
        rowKey="id"
        search={{ labelWidth: "auto", showHiddenNum: true }}
        pagination={pagination}
        dateFormatter="string"
        headerTitle="通知管理"
        toolBarRender={toolBarRender}
      />
      <SendModal ref={sendModalRef} onConfirm={handleFormModalConfirm} />
    </>
  );
};

export default NovelNotification;