import { sendNovelNotificationApi } from "@/api/app/novel/novel-notification";
import LoadingButton from "@/components/LoadingButton";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { Form, Input, InputNumber, Modal, Radio } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface SendModalRef {
  showSendModal: () => void;
}

interface ModalProps {
  onConfirm: () => void;
}

const SendModal = forwardRef<SendModalRef, ModalProps>(({ onConfirm }, ref) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    showSendModal() {
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
          const payload = {
            userId: values.target ?? 0,
            title: values.title,
            content: values.content
          };
          const { msg, code } = await sendNovelNotificationApi(payload);
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
      title="发送系统通知"
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
          发送
        </LoadingButton>
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ target: 0 }}>
        <Form.Item
          name="target"
          label="接收对象"
          extra="选择【全部读者】将推送给所有正常状态读者；选择【指定读者】需填写该用户的 9 位数字 ID。"
          rules={[{ required: true, message: "请选择接收对象" }]}
        >
          <Radio.Group>
            <Radio value={0}>全部读者</Radio>
            <Radio value={1}>指定读者</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={prev => prev.target !== form.getFieldValue("target")}>
          {() =>
            form.getFieldValue("target") === 1 ? (
              <Form.Item
                name="userId"
                label="指定读者 ID"
                rules={[{ required: true, message: "请输入读者 ID" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="请输入读者唯一 ID" />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          name="title"
          label="通知标题"
          rules={[
            { required: true, message: "请输入通知标题" },
            { max: 100, message: "通知标题不能超过100个字符" }
          ]}
        >
          <Input placeholder="请输入通知标题" showCount maxLength={100} />
        </Form.Item>
        <Form.Item
          name="content"
          label="通知内容"
          rules={[
            { required: true, message: "请输入通知内容" },
            { max: 2000, message: "通知内容不能超过2000个字符" }
          ]}
        >
          <Input.TextArea placeholder="请输入通知内容" showCount maxLength={2000} rows={6} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default SendModal;