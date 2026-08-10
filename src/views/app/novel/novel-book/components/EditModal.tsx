import { getNovelCategoryPageApi } from "@/api/app/novel/novel-category";
import { NovelBookModel, updateNovelBookApi } from "@/api/app/novel/novel-book";
import LoadingButton from "@/components/LoadingButton";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { Form, Input, InputNumber, Modal, Radio, Select } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface EditModalRef {
  showEditModal: (data: NovelBookModel) => void;
}

interface ModalProps {
  onConfirm: () => void;
}

interface CategoryOption {
  label: string;
  value: number;
}

const EditModal = forwardRef<EditModalRef, ModalProps>(({ onConfirm }, ref) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    if (isModalOpen) {
      getNovelCategoryPageApi({ current: 1, pageSize: 100 })
        .then(res => {
          const list = (res?.data?.list || []) as Array<{ id?: number; name?: string }>;
          setCategoryOptions(list.map(c => ({ label: c.name || "", value: c.id || 0 })));
        })
        .catch(() => setCategoryOptions([]));
    }
  }, [isModalOpen]);

  useImperativeHandle(ref, () => ({
    showEditModal(data) {
      setEditingId(data.id);
      form.resetFields();
      form.setFieldsValue({
        title: data.title,
        author: data.author,
        cover: data.cover,
        category: data.category ? Number(data.category) : undefined,
        tags: data.tags || [],
        slogan: data.slogan,
        description: data.description,
        serialStatus: data.serialStatus || "1",
        status: data.status || "1",
        wordCount: data.wordCount || 0,
        chapters: data.chapters || 0,
        publishDate: data.publishDate ? String(data.publishDate).slice(0, 10) : undefined,
        readUrl: data.readUrl,
        isFeatured: data.isFeatured || 0,
      });
      setIsModalOpen(true);
    }
  }));

  const handleConfirm = (done: () => void) => {
    form
      .validateFields()
      .then(async values => {
        if (!editingId) return;
        try {
          const payload = {
            title: values.title,
            author: values.author,
            cover: values.cover || "",
            category: values.category ? String(values.category) : "",
            tags: values.tags || [],
            slogan: values.slogan || "",
            description: values.description || "",
            serialStatus: values.serialStatus,
            status: values.status,
            wordCount: values.wordCount || 0,
            chapters: values.chapters || 0,
            publishDate: values.publishDate || "",
            readUrl: values.readUrl || "",
            isFeatured: values.isFeatured || 0,
          };
          const { msg, code } = await updateNovelBookApi(editingId, payload);
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
      })
      .catch(error => {
        console.error("validate error：", error);
        message.error("表单校验失败");
        done();
      });
  };

  return (
    <Modal
      title="编辑书籍"
      getContainer={false}
      width={640}
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
          保存
        </LoadingButton>
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="title"
            label="书名"
            rules={[
              { required: true, message: "请输入书名" },
              { max: 100, message: "书名不能超过100个字符" }
            ]}
          >
            <Input placeholder="请输入书名" showCount maxLength={100} />
          </Form.Item>
          <Form.Item
            name="author"
            label="作者"
            rules={[
              { required: true, message: "请输入作者" },
              { max: 64, message: "作者不能超过64个字符" }
            ]}
          >
            <Input placeholder="请输入作者" showCount maxLength={64} />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: "请选择分类" }]}>
            <Select placeholder="请选择分类" showSearch optionFilterProp="label" options={categoryOptions} />
          </Form.Item>
          <Form.Item name="serialStatus" label="连载状态" rules={[{ required: true, message: "请选择连载状态" }]}>
            <Radio.Group>
              <Radio value="1">连载中</Radio>
              <Radio value="2">已完结</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入标签后回车"
              tokenSeparators={[",", "，"]}
              open={false}
              suffixIcon={null}
              maxTagCount={8}
            />
          </Form.Item>
          <Form.Item name="isFeatured" label="首页精选" initialValue={0}>
            <Radio.Group>
              <Radio value={1}>精选</Radio>
              <Radio value={0}>普通</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="wordCount" label="字数（整数，用于筛选）" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="字数" />
          </Form.Item>
          <Form.Item name="chapters" label="章节数" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="章节数" />
          </Form.Item>
          <Form.Item name="publishDate" label="发布日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="status" label="上架状态" rules={[{ required: true, message: "请选择上架状态" }]}>
            <Radio.Group>
              <Radio value="1">上架</Radio>
              <Radio value="2">下架</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
        <Form.Item name="slogan" label="一句话推荐语" rules={[{ max: 30, message: "推荐语不能超过30个字符" }]}>
          <Input placeholder="请输入一句话推荐语" showCount maxLength={30} />
        </Form.Item>
        <Form.Item name="cover" label="封面 URL">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="readUrl" label="阅读链接">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="description" label="简介" rules={[{ max: 500, message: "简介不能超过500个字符" }]}>
          <Input.TextArea rows={3} placeholder="请输入简介" showCount maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default EditModal;
