import { delNovelTagApi, getNovelTagPageApi, NovelTagModel } from "@/api/app/novel/novel-tag";
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

const NovelTag: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();
  const formModalRef = useRef<FormModalRef>(null);

  const columns: ProColumns<NovelTagModel>[] = [
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
      title: "标签编号",
      dataIndex: "id",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "所属分类",
      dataIndex: "category",
      width: 140,
      align: "left"
    },
    {
      title: "标签名称",
      dataIndex: "name",
      width: 160,
      align: "left"
    },
    {
      title: "标签名称",
      dataIndex: "name",
      hideInTable: true,
      width: 160
    },
    {
      title: "排序",
      dataIndex: "sort",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      align: "left",
      valueEnum: {
        "1": { text: "正常", status: "Success" },
        "2": { text: "停用", status: "Error" }
      }
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
      title: "操作",
      valueType: "option",
      align: "center",
      fixed: "right",
      width: 120,
      render: (_, data) => (
        <Space>
          <HocAuth permission={["app:novel-tag:edit"]}>
            <LoadingButton
              key="edit"
              type="link"
              size="small"
              onClick={done => handleShowEditFormModal(data, done)}
            >
              编辑
            </LoadingButton>
          </HocAuth>
          <HocAuth permission={["app:novel-tag:del"]}>
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

  const handleShowEditFormModal = (data: NovelTagModel, done: () => void) => {
    formModalRef.current?.showEditFormModal(data);
    setTimeout(() => done(), 1000);
  };

  const handleFormModalConfirm = () => {
    actionRef.current?.reload(false);
  };

  const handleDelete = (id: number, done: () => void) => {
    modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "是否确认删除编号为 " + id + " 的标签？",
      okText: "确认",
      cancelText: "取消",
      maskClosable: true,
      onCancel: () => {
        done();
      },
      onOk: async () => {
        try {
          const { code, msg } = await delNovelTagApi([id!]);
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
    <HocAuth permission={["app:novel-tag:add"]}>
      <LoadingButton type="primary" key="addTable" icon={<PlusCircleOutlined />} onClick={done => handleShowAddFormModal(done)}>
        新增标签
      </LoadingButton>
    </HocAuth>
  ];

  return (
    <>
      <ProTable<NovelTagModel>
        className="ant-pro-table-scroll"
        columns={columns}
        actionRef={actionRef}
        formRef={tableFormRef}
        bordered
        cardBordered
        defaultSize="small"
        scroll={{ x: "1200", y: "100%" }}
        request={async params => {
          const { data } = await getNovelTagPageApi(params);
          return formatDataForProTable<NovelTagModel>(data);
        }}
        columnsState={{
          persistenceKey: "use-pro-table-key-novel-tag",
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
        headerTitle="小说标签管理"
        toolBarRender={toolBarRender}
      />
      <FormModal ref={formModalRef} onConfirm={handleFormModalConfirm} />
    </>
  );
};

export default NovelTag;
