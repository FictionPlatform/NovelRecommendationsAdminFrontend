import { delNovelNoticeApi, getNovelNoticePageApi, NovelNoticeModel } from "@/api/app/novel/novel-notice";
import HocAuth from "@/components/HocAuth";
import LoadingButton from "@/components/LoadingButton";
import { pagination } from "@/config/proTable";
import { ResultEnum } from "@/enums/httpEnum";
import { message, modal } from "@/hooks/useMessage";
import { formatDataForProTable } from "@/utils";
import { DeleteOutlined, ExclamationCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns, ProFormInstance } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Space } from "antd";
import React, { useRef } from "react";
import FormModal, { FormModalRef } from "./components/FormModal";

const NovelNotice: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();
  const formModalRef = useRef<FormModalRef>(null);

  // 定义列
  const columns: ProColumns<NovelNoticeModel>[] = [
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
      title: "公告编号",
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
      title: "标题关键字",
      dataIndex: "keyword",
      hideInTable: true,
      width: 160
    },
    {
      title: "公告内容",
      dataIndex: "content",
      hideInSearch: true,
      width: 320,
      align: "left",
      ellipsis: true
    },
    {
      title: "触达读者数",
      dataIndex: "recipientCount",
      hideInSearch: true,
      width: 100,
      align: "left"
    },
    {
      title: "发布管理员",
      dataIndex: "createBy",
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
          <HocAuth permission={["app:novel-notice:del"]}>
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

  const handleShowAddFormModal = (done: () => void) => {
    formModalRef.current?.showAddFormModal();
    setTimeout(() => done(), 1000);
  };

  const handleFormModalConfirm = () => {
    actionRef.current?.reload(false);
  };

  const handleDelete = (id: number, done: () => void) => {
    modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "是否确认删除编号为 " + id + " 的公告？删除后读者端对应系统通知将同步删除。",
      okText: "确认",
      cancelText: "取消",
      maskClosable: true,
      onCancel: () => {
        done();
      },
      onOk: async () => {
        try {
          const { code, msg } = await delNovelNoticeApi([id!]);
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
    <HocAuth permission={["app:novel-notice:add"]}>
      <LoadingButton type="primary" key="addTable" icon={<PlusCircleOutlined />} onClick={done => handleShowAddFormModal(done)}>
        发布公告
      </LoadingButton>
    </HocAuth>
  ];

  return (
    <>
      <ProTable<NovelNoticeModel>
        className="ant-pro-table-scroll"
        columns={columns}
        actionRef={actionRef}
        formRef={tableFormRef}
        bordered
        cardBordered
        defaultSize="small"
        scroll={{ x: "1600", y: "100%" }}
        request={async params => {
          const { data } = await getNovelNoticePageApi(params);
          return formatDataForProTable<NovelNoticeModel>(data);
        }}
        columnsState={{
          persistenceKey: "use-pro-table-key-novel-notice",
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
        headerTitle="系统公告管理"
        toolBarRender={toolBarRender}
      />
      <FormModal ref={formModalRef} onConfirm={handleFormModalConfirm} />
    </>
  );
};

export default NovelNotice;
