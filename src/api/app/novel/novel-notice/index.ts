import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelNoticeModel {
  id?: number;
  title?: string;
  content?: string;
  createBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  recipientCount?: number;
}

export interface NovelNoticeQuery extends ReqPage {
  keyword?: string;
}

export const getNovelNoticePageApi = (params: NovelNoticeQuery) => {
  return request.get<ResPage<NovelNoticeModel>>(`/admin-api/v1/app/novel/notice`, {
    ...params,
    pageIndex: params?.current
  });
};

export const addNovelNoticeApi = (data: object) => {
  return request.post<object>(`/admin-api/v1/app/novel/notice`, data);
};

export const delNovelNoticeApi = (ids: number[]) => {
  return request.delete<object>(`/admin-api/v1/app/novel/notice`, { ids });
};
