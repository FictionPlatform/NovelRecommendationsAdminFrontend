import { delNovelFeedbackApi, getNovelFeedbackPageApi, NovelFeedbackModel } from "@/api/app/novel/novel-feedback";
import HocAuth from "@/components/HocAuth";
import LoadingButton from "@/components/LoadingButton";
import { pagination } from "@/config/proTable";
import { ResultEnum } from "@/enums/httpEnum";
import { message, modal } from "@/hooks/useMessage";
import { formatDataForProTable } from "@/utils";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns, ProFormInstance } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Space, Tag } from "antd";
import React from "react";

const feedbackTypeOptions = {
  A: "产品功能建议",
  B: "UI样式建议",
  C: "主界面功能问题",
  D: "视频窗口问题",
  E: "程序报错/性能问题",
  F: "侵犯版权举报",
  G: "侮辱诽谤举报",
  H: "其他"
};

const kindOptions = {
  feedback: "反馈",
  complaint: "投诉"
};

const NovelFeedback: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();

  // 定义列
  const columns: ProColumns<NovelFeedbackModel>[] = [
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
      title: "反馈编号",
      dataIndex: "id",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "用户编号",
      dataIndex: "userId",
      width: 80,
      align: "left"
    },
    {
      title: "用户名",
      dataIndex: "userName",
      width: 100,
      align: "left",
      ellipsis: true
    },
    {
      title: "反馈类型",
      dataIndex: "type",
      valueType: "select",
      valueEnum: feedbackTypeOptions,
      width: 120,
      align: "left",
      render: (_, record) => record.typeLabel || (record.type ? feedbackTypeOptions[record.type as keyof typeof feedbackTypeOptions] || record.type : "-")
    },
    {
      title: "类别",
      dataIndex: "kind",
      valueType: "select",
      valueEnum: kindOptions,
      width: 100,
      align: "left",
      render: (_, record) => {
        const kind = record.kind || "feedback";
        return <Tag color={kind === "complaint" ? "red" : "blue"}>{kindOptions[kind as keyof typeof kindOptions] || kind}</Tag>;
      }
    },
    {
      title: "反馈内容",
      dataIndex: "content",
      hideInSearch: true,
      width: 320,
      align: "left",
      ellipsis: true
    },
    {
      title: "内容关键字",
      dataIndex: "keyword",
      hideInTable: true,
      width: 160
    },
    {
      title: "状态",
      dataIndex: "status",
      hideInSearch: true,
      width: 100,
      align: "left"
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      valueType: "dateTime",
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
          <HocAuth permission={["app:novel-feedback:del"]}>
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

  const handleDelete = (id: number, done: () => void) => {
    modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "是否确认删除编号为 " + id + " 的反馈记录?",
      okText: "确认",
      cancelText: "取消",
      maskClosable: true,
      onCancel: () => {
        done();
      },
      onOk: async () => {
        try {
          const { code, msg } = await delNovelFeedbackApi([id!]);
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
    <ProTable<NovelFeedbackModel>
      className="ant-pro-table-scroll"
      columns={columns}
      actionRef={actionRef}
      formRef={tableFormRef}
      bordered
      cardBordered
      defaultSize="small"
      scroll={{ x: "1600", y: "100%" }}
      request={async params => {
        const { data } = await getNovelFeedbackPageApi(params);
        return formatDataForProTable<NovelFeedbackModel>(data);
      }}
      columnsState={{
        persistenceKey: "use-pro-table-key-novel-feedback",
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
      headerTitle="反馈/投诉管理"
    />
  );
};

export default NovelFeedback;
