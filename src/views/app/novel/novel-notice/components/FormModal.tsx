import { addNovelNoticeApi } from "@/api/app/novel/novel-notice";
import LoadingButton from "@/components/LoadingButton";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { Form, Input, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface FormModalRef {
  showAddFormModal: () => void;
}

interface ModalProps {
  onConfirm: () => void;
}

const FormModal = forwardRef<FormModalRef, ModalProps>(({ onConfirm }, ref) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    showAddFormModal() {
      reset();
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
          const { msg, code } = await addNovelNoticeApi(values);
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
      title="发布公告"
      getContainer={false}
      width={800}
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
          name="title"
          label="公告标题"
          rules={[
            { required: true, message: "请输入公告标题" },
            { max: 100, message: "公告标题不能超过100个字符" }
          ]}
        >
          <Input placeholder="请输入公告标题" showCount maxLength={100} />
        </Form.Item>
        <Form.Item
          name="content"
          label="公告内容"
          rules={[
            { required: true, message: "请输入公告内容" },
            { max: 2000, message: "公告内容不能超过2000个字符" }
          ]}
        >
          <Input.TextArea placeholder="请输入公告内容" showCount maxLength={2000} rows={6} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default FormModal;
