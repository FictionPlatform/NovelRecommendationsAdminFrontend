import { addNovelTagApi, NovelTagModel, updateNovelTagApi } from "@/api/app/novel/novel-tag";
import { getNovelCategoryPageApi } from "@/api/app/novel/novel-category";
import LoadingButton from "@/components/LoadingButton";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { Form, Input, InputNumber, Modal, Radio, Select } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface FormModalRef {
  showAddFormModal: () => void;
  showEditFormModal: (data: NovelTagModel) => void;
}

interface ModalProps {
  onConfirm: () => void;
}

interface CategoryOption {
  label: string;
  value: number;
}

const FormModal = forwardRef<FormModalRef, ModalProps>(({ onConfirm }, ref) => {
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
        .catch(() => {
          setCategoryOptions([]);
        });
    }
  }, [isModalOpen]);

  useImperativeHandle(ref, () => ({
    showAddFormModal() {
      setEditingId(undefined);
      reset();
      setIsModalOpen(true);
    },
    showEditFormModal(data) {
      setEditingId(data.id);
      reset();
      form.setFieldsValue({
        categoryId: data.categoryId,
        name: data.name,
        sort: data.sort,
        status: data.status || "1"
      });
      setIsModalOpen(true);
    }
  }));

  const reset = () => {
    setTimeout(() => form.resetFields(), 100);
  };

  const handleConfirm = (done: () => void) => {
    form
      .validateFields()
      .then(async values => {
        try {
          const payload = { ...values };
          const { msg, code } = editingId
            ? await updateNovelTagApi(editingId, payload)
            : await addNovelTagApi(payload);
          if (code !== ResultEnum.SUCCESS) {
            message.error(msg);
            return;
          }
          message.success(msg);
          reset();
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
      title={editingId ? "编辑标签" : "新增标签"}
      getContainer={false}
      width={520}
      open={isModalOpen}
      maskClosable={false}
      keyboard={false}
      onCancel={() => {
        reset();
        setIsModalOpen(false);
      }}
      destroyOnHidden
      footer={[
        <LoadingButton
          key="cancel"
          onClick={done => {
            reset();
            setIsModalOpen(false);
            done();
          }}
        >
          取消
        </LoadingButton>,
        <LoadingButton key="confirm" type="primary" onClick={done => handleConfirm(done)}>
          确定
        </LoadingButton>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="categoryId"
          label="所属分类"
          rules={[{ required: true, message: "请选择所属分类" }]}
        >
          <Select
            placeholder="请选择所属分类"
            showSearch
            optionFilterProp="label"
            options={categoryOptions}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="标签名称"
          rules={[
            { required: true, message: "请输入标签名称" },
            { max: 32, message: "标签名称不能超过32个字符" }
          ]}
        >
          <Input placeholder="请输入标签名称" showCount maxLength={32} />
        </Form.Item>
        <Form.Item name="sort" label="排序" initialValue={0} rules={[{ required: true, message: "请输入排序" }]}>
          <InputNumber min={0} max={9999} style={{ width: "100%" }} placeholder="数值越小越靠前" />
        </Form.Item>
        <Form.Item name="status" label="状态" initialValue="1">
          <Radio.Group>
            <Radio value="1">正常</Radio>
            <Radio value="2">停用</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default FormModal;
