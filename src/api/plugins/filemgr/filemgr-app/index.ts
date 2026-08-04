import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";
import { ResultEnum } from "@/enums/httpEnum";
import { UploadRequestOption } from "rc-upload/lib/interface";

export interface FilemgrAppModel {
  id?: number;
  version?: string;
  platform?: string;
  appType?: string;
  localAddress?: string;
  downloadType?: string;
  downloadUrl?: string;
  remark?: string;
  status?: string;
  createBy?: number;
  createdAt?: Date;
  updateBy?: number;
  updatedAt?: Date;
}

export const getFilemgrAppPageApi = (params: ReqPage) => {
  return request.get<ResPage<FilemgrAppModel>>(`/admin-api/v1/plugins/filemgr/filemgr-app`, {
    ...params,
    pageIndex: params?.current
  });
};

export const getFilemgrAppApi = (id: number) => {
  return request.get<FilemgrAppModel>(`/admin-api/v1/plugins/filemgr/filemgr-app/` + id);
};

export const addFilemgrAppApi = (data: object) => {
  return request.post<object>(`/admin-api/v1/plugins/filemgr/filemgr-app`, data);
};

export const updateFilemgrAppApi = (id: number, data: object) => {
  return request.put<object>("/admin-api/v1/plugins/filemgr/filemgr-app/" + id, data);
};

export const delFilemgrAppApi = (params: number[]) => {
  return request.delete<object>(`/admin-api/v1/plugins/filemgr/filemgr-app`, { ids: params });
};

export const exportFilemgrAppApi = (query: object) => {
  return request.download(`/admin-api/v1/plugins/filemgr/filemgr-app/export`, query);
};

export const exportUploadFileAppApi = (options: UploadRequestOption) => {
  const { file, onSuccess, onError } = options;

  const formData = new FormData();
  formData.append("file", file);

  return request
    .post<object>(`/admin-api/v1/plugins/filemgr/filemgr-app/upload`, formData)
    .then(response => {
      // 后端业务码非成功时（HTTP 仍是 200）不能回调成功，否则错误信息会被当作上传地址写入表单
      if (response.code === ResultEnum.SUCCESS) {
        if (onSuccess) {
          onSuccess(response.data, file);
        }
      } else if (onError) {
        onError(new Error(response.msg || "上传失败"));
      }
    })
    .catch(error => {
      if (onError) {
        onError(error);
      }
    });
};
