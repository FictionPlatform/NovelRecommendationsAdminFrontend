import { getNovelBookPageApi, mergeNovelBookApi, NovelBookModel } from "@/api/app/novel/novel-book";
import LoadingButton from "@/components/LoadingButton";
import { ResultEnum } from "@/enums/httpEnum";
import { message, modal } from "@/hooks/useMessage";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Avatar, Form, Input, Modal, Select } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface MergeModalRef {
  showMergeModal: (source: NovelBookModel) => void;
}

interface ModalProps {
  onConfirm: () => void;
}

interface BookOption {
  label: string;
  value: number;
  title: string;
  author: string;
  reviewCount: number;
  status: string;
}

const MergeModal = forwardRef<MergeModalRef, ModalProps>(({ onConfirm }, ref) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [source, setSource] = useState<NovelBookModel | null>(null);
  const [bookOptions, setBookOptions] = useState<BookOption[]>([]);
  const [searching, setSearching] = useState(false);

  useImperativeHandle(ref, () => ({
    showMergeModal(data) {
      setSource(data);
      setBookOptions([]);
      form.resetFields();
      setIsModalOpen(true);
    }
  }));

  // 目标书搜索（排除源书自身与下架书）
  const searchTarget = async (keyword: string) => {
    if (!source) return;
    setSearching(true);
    try {
      const res = await getNovelBookPageApi({ current: 1, pageSize: 20, keyword });
      const list = (res?.data?.list || []) as NovelBookModel[];
      setBookOptions(
        list
          .filter(b => b.id !== source.id && b.status === "1")
          .map(b => ({
            label: `${b.title}（${b.author}）`,
            value: b.id || 0,
            title: b.title || "",
            author: b.author || "",
            reviewCount: b.reviewCount || 0,
            status: b.status || "1"
          }))
      );
    } catch {
      setBookOptions([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      searchTarget("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleConfirm = (done: () => void) => {
    form
      .validateFields()
      .then(async values => {
        if (!source) return;
        const target = bookOptions.find(o => o.value === values.targetBookId);
        modal.confirm({
          title: "确认合并书籍",
          icon: <ExclamationCircleOutlined />,
          content: (
            <div style={{ fontSize: 13, lineHeight: 2 }}>
              将把源书 <b>《{source.title}》</b>（书评 {source.reviewCount} 条）
              的书评 / 书架收藏 / 话题引用全部迁移到目标书 <b>《{target?.title}》</b>，
              <br />
              并聚合评分与点击数。<span style={{ color: "#d4380d" }}>源书将被下架保留。</span>
              <br />
              是否继续？
            </div>
          ),
          okText: "确认合并",
          cancelText: "取消",
          maskClosable: true,
          onOk: async () => {
            try {
              const { msg, code } = await mergeNovelBookApi({
                sourceBookId: source.id!,
                targetBookId: values.targetBookId
              });
              if (code !== ResultEnum.SUCCESS) {
                message.error(msg);
                return;
              }
              message.success(msg);
              setIsModalOpen(false);
              onConfirm();
            } finally {
              done();
            }
          }
        });
      })
      .catch(error => {
        console.error("validate error：", error);
        message.error("请选择目标书");
        done();
      });
  };

  return (
    <Modal
      title="合并书籍"
      getContainer={false}
      width={560}
      open={isModalOpen}
      maskClosable={false}
      keyboard={false}
      onCancel={() => {
        form.resetFields();
        setIsModalOpen(false);
      }}
      destroyOnHidden
      footer={[
        <LoadingButton
          key="cancel"
          onClick={done => {
            form.resetFields();
            setIsModalOpen(false);
            done();
          }}
        >
          取消
        </LoadingButton>,
        <LoadingButton key="confirm" type="primary" onClick={done => handleConfirm(done)}>
          下一步
        </LoadingButton>
      ]}
    >
      <div className="space-y-4">
        {source && (
          <Alert
            type="warning"
            showIcon
            message={`源书：${source.title}（${source.author}）`}
            description={`书评 ${source.reviewCount} 条 · 点击 ${source.clicks} · 合并后自动下架`}
          />
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="targetBookId"
            label="选择目标书（保留书）"
            rules={[{ required: true, message: "请选择目标书" }]}
          >
            <Select
              placeholder="搜索书名 / 作者选择目标书"
              showSearch
              filterOption={false}
              onSearch={searchTarget}
              loading={searching}
              options={bookOptions.map(o => ({
                value: o.value,
                label: (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={22} src={undefined} style={{ background: "#d4a84b", fontSize: 11 }}>
                      {o.title.charAt(0)}
                    </Avatar>
                    <span>
                      {o.title}（{o.author}）
                      <span style={{ color: "#999", fontSize: 12, marginLeft: 6 }}>书评 {o.reviewCount} 条</span>
                    </span>
                  </div>
                )
              }))}
              notFoundContent={searching ? "搜索中..." : "未找到可合并的目标书"}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
});

export default MergeModal;
