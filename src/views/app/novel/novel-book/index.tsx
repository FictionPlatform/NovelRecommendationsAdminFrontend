import { getNovelBookPageApi, NovelBookModel, updateNovelBookApi } from "@/api/app/novel/novel-book";
import HocAuth from "@/components/HocAuth";
import LoadingButton from "@/components/LoadingButton";
import { pagination } from "@/config/proTable";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { formatDataForProTable } from "@/utils";
import { EditOutlined, MergeOutlined, UpCircleOutlined, DownCircleOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns, ProFormInstance } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Space, Tag, Image, Tooltip } from "antd";
import React, { useRef } from "react";
import MergeModal, { MergeModalRef } from "./components/MergeModal";
import EditModal, { EditModalRef } from "./components/EditModal";

const NovelBook: React.FC = () => {
  const actionRef = React.useRef<ActionType>();
  const tableFormRef = React.useRef<ProFormInstance>();
  const mergeModalRef = useRef<MergeModalRef>(null);
  const editModalRef = useRef<EditModalRef>(null);

  const columns: ProColumns<NovelBookModel>[] = [
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
      title: "编号",
      dataIndex: "id",
      hideInSearch: true,
      width: 70,
      align: "left"
    },
    {
      title: "封面",
      dataIndex: "cover",
      hideInSearch: true,
      width: 60,
      align: "center",
      render: (_, data) =>
        data.cover ? (
          <Image src={data.cover} width={36} height={48} style={{ objectFit: "cover", borderRadius: 4 }} />
        ) : (
          <span className="text-slate-400">-</span>
        )
    },
    {
      title: "书名",
      dataIndex: "title",
      width: 200,
      align: "left"
    },
    {
      title: "作者",
      dataIndex: "author",
      width: 120,
      align: "left"
    },
    {
      title: "分类",
      dataIndex: "categoryName",
      hideInSearch: true,
      width: 90,
      align: "left"
    },
    {
      title: "分类",
      dataIndex: "category",
      hideInTable: true,
      width: 90
    },
    {
      title: "评分",
      dataIndex: "rating",
      hideInSearch: true,
      width: 70,
      align: "left"
    },
    {
      title: "书评数",
      dataIndex: "reviewCount",
      hideInSearch: true,
      width: 80,
      align: "left"
    },
    {
      title: "点击数",
      dataIndex: "clicks",
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
        "1": { text: "上架", status: "Success" },
        "2": { text: "下架", status: "Error" }
      }
    },
    {
      title: "操作",
      valueType: "option",
      align: "center",
      fixed: "right",
      width: 110,
      render: (_, data) => (
        <Space>
          <HocAuth permission={["app:novel-book:edit"]}>
            <LoadingButton
              key="edit"
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={done => handleShowEditModal(data, done)}
            >
              编辑
            </LoadingButton>
          </HocAuth>
          <HocAuth permission={["app:novel-book:edit"]}>
            <LoadingButton
              key="toggle-status"
              type="link"
              size="small"
              icon={data.status === "1" ? <DownCircleOutlined /> : <UpCircleOutlined />}
              onClick={done => handleToggleStatus(data, done)}
            >
              {data.status === "1" ? "下架" : "上架"}
            </LoadingButton>
          </HocAuth>
          <HocAuth permission={["app:novel-book:merge"]}>
            <LoadingButton
              key="merge"
              type="link"
              size="small"
              icon={<MergeOutlined />}
              disabled={data.status === "2"}
              onClick={done => handleShowMergeModal(data, done)}
            >
              合并
            </LoadingButton>
          </HocAuth>
        </Space>
      )
    }
  ];

  const handleShowMergeModal = (data: NovelBookModel, done: () => void) => {
    mergeModalRef.current?.showMergeModal(data);
    setTimeout(() => done(), 1000);
  };

  const handleShowEditModal = (data: NovelBookModel, done: () => void) => {
    editModalRef.current?.showEditModal(data);
    setTimeout(() => done(), 1000);
  };

  const handleToggleStatus = async (data: NovelBookModel, done: () => void) => {
    try {
      const nextStatus = data.status === "1" ? "2" : "1";
      const { msg, code } = await updateNovelBookApi(data.id!, { status: nextStatus });
      if (code !== ResultEnum.SUCCESS) {
        message.error(msg);
        return;
      }
      message.success(msg);
      actionRef.current?.reload(false);
    } finally {
      done();
    }
  };

  const handleMergeModalConfirm = () => {
    actionRef.current?.reload(false);
  };

  const handleEditModalConfirm = () => {
    actionRef.current?.reload(false);
  };

  const toolBarRender = () => [
    <Tooltip key="tip" title="将重复书籍（源书）合并到保留书籍（目标书），源书将被下架">
      <Tag color="gold" style={{ marginTop: 6 }}>合并说明：源书数据迁移到目标书后自动下架</Tag>
    </Tooltip>
  ];

  return (
    <>
      <ProTable<NovelBookModel>
        className="ant-pro-table-scroll"
        columns={columns}
        actionRef={actionRef}
        formRef={tableFormRef}
        bordered
        cardBordered
        defaultSize="small"
        scroll={{ x: "1400", y: "100%" }}
        request={async params => {
          const { data } = await getNovelBookPageApi(params);
          return formatDataForProTable<NovelBookModel>(data);
        }}
        columnsState={{
          persistenceKey: "use-pro-table-key-novel-book",
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
        headerTitle="小说书籍管理"
        toolBarRender={toolBarRender}
      />
      <MergeModal ref={mergeModalRef} onConfirm={handleMergeModalConfirm} />
      <EditModal ref={editModalRef} onConfirm={handleEditModalConfirm} />
    </>
  );
};

export default NovelBook;
