import { banNovelUserPostApi, NovelUserModel } from "@/api/app/novel/novel-user";
import LoadingButton from "@/components/LoadingButton";
import { ResultEnum } from "@/enums/httpEnum";
import { message } from "@/hooks/useMessage";
import { DatePicker, Form, Input, Modal } from "antd";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface BanPostModalRef {
  showBanPostModal: (row: NovelUserModel) => void;
}

interface ModalProps {
  onConfirm: () => void;
}

const BanPostModal = forwardRef<BanPostModalRef, ModalProps>(({ onConfirm }, ref) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState<NovelUserModel | null>(null);

  useImperativeHandle(ref, () => ({
    showBanPostModal(row) {
      setCurrent(row);
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
          const { msg, code } = await banNovelUserPostApi(current!.userId!, {
            banUntil: values.banUntil ? dayjs(values.banUntil).toISOString() : null,
            reason: values.reason ?? ""
          });
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
      title={current?.banPostUntil ? "解除禁言 / 修改禁言时间" : "禁止发帖"}
      getContainer={false}
      width={600}
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
      <Form form={form} layout="vertical" initialValues={{ banUntil: null }}>
        <Form.Item
          name="banUntil"
          label="禁言截止时间"
          tooltip="不选择并直接提交即为解除禁言"
          extra={current?.banPostUntil ? `当前截止时间：${dayjs(current.banPostUntil).format("YYYY-MM-DD HH:mm:ss")}` : undefined}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            placeholder="请选择禁言截止时间"
            disabledDate={current => current && current.isBefore(dayjs().startOf("day"))}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="禁言原因"
          rules={[{ max: 255, message: "禁言原因不能超过255个字符" }]}
        >
          <Input.TextArea placeholder="请输入禁言原因（选填）" showCount maxLength={255} rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default BanPostModal;
