import { changeNovelPostStatusApi, getNovelPostPageApi, NovelPostModel } from "@/api/app/novel/novel-post";
import HocAuth from "@/components/HocAuth";
import LoadingButton from "@/components/LoadingButton";
import { pagination } from "@/config/proTable";
import { ResultEnum } from "@/enums/httpEnum";
import { message, modal } from "@/hooks/useMessage";
import { formatDataForProTable } from "@/utils";
import { ExclamationCircleOutlined, RedoOutlined, StopOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns, ProFormInstance } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Space, Tag } from "antd";
import React from "react";

const NovelPost: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();

  // 定义列
  const columns: ProColumns<NovelPostModel>[] = [
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
      title: "帖子编号",
      dataIndex: "id",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 220,
      align: "left",
      ellipsis: true
    },
    {
      title: "标题关键字",
      dataIndex: "keyword",
      hideInTable: true,
      width: 160
    },
    {
      title: "作者",
      dataIndex: "userName",
      hideInSearch: true,
      width: 100,
      align: "left",
      ellipsis: true
    },
    {
      title: "内容摘要",
      dataIndex: "summary",
      hideInSearch: true,
      width: 280,
      align: "left",
      ellipsis: true
    },
    {
      title: "主题标签",
      dataIndex: "topicTag",
      hideInSearch: true,
      width: 100,
      align: "center",
      render: (_, record) => (record.topicTag ? <Tag color="blue">{record.topicTag}</Tag> : "-")
    },
    {
      title: "字数",
      dataIndex: "wordCount",
      hideInSearch: true,
      width: 80,
      align: "right"
    },
    {
      title: "点赞",
      dataIndex: "likes",
      hideInSearch: true,
      width: 80,
      align: "right"
    },
    {
      title: "评论",
      dataIndex: "commentCount",
      hideInSearch: true,
      width: 80,
      align: "right"
    },
    {
      title: "收藏",
      dataIndex: "collections",
      hideInSearch: true,
      width: 80,
      align: "right"
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        "1": { text: "正常" },
        "2": { text: "禁止访问" }
      },
      width: 100,
      align: "center",
      render: (_, record) =>
        record.status === "1" ? <Tag color="success">正常</Tag> : <Tag color="red">禁止访问</Tag>
    },
    {
      title: "发布时间",
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
          <HocAuth permission={["app:novel-post:status"]}>
            <LoadingButton
              key="status"
              type="link"
              size="small"
              danger={data.status === "1"}
              icon={data.status === "1" ? <StopOutlined /> : <RedoOutlined />}
              onClick={done => handleStatusChange(data, done)}
            >
              {data.status === "1" ? "禁止访问" : "恢复"}
            </LoadingButton>
          </HocAuth>
        </Space>
      )
    }
  ];

  const handleStatusChange = (record: NovelPostModel, done: () => void) => {
    const actionText = record.status === "1" ? "禁止访问" : "恢复";
    modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content:
        record.status === "1"
          ? `是否确认禁止访问帖子「${record.title}」？禁止后读者端将不再展示该帖。`
          : `是否确认恢复帖子「${record.title}」的访问？恢复后读者端将重新展示该帖。`,
      okText: "确认",
      cancelText: "取消",
      maskClosable: true,
      onCancel: () => {
        done();
      },
      onOk: async () => {
        try {
          const { code, msg } = await changeNovelPostStatusApi(record.id!, record.status === "1" ? "2" : "1");
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

  return (
    <>
      <ProTable<NovelPostModel>
        className="ant-pro-table-scroll"
        columns={columns}
        actionRef={actionRef}
        formRef={tableFormRef}
        bordered
        cardBordered
        defaultSize="small"
        scroll={{ x: "1600", y: "100%" }}
        request={async params => {
          const { data } = await getNovelPostPageApi(params);
          return formatDataForProTable<NovelPostModel>(data);
        }}
        columnsState={{
          persistenceKey: "use-pro-table-key-novel-post",
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
        headerTitle="帖子管理"
      />
    </>
  );
};

export default NovelPost;
