import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelNotificationModel {
  id?: number;
  userId?: number;
  userName?: string;
  title?: string;
  content?: string;
  isRead?: string;
  source?: string;
  createdAt?: string;
  createdAtStr?: string;
}

export interface NovelNotificationQuery extends ReqPage {
  keyword?: string;
  source?: string;
}

export const getNovelNotificationPageApi = (params: NovelNotificationQuery) => {
  return request.get<ResPage<NovelNotificationModel>>(`/admin-api/v1/app/novel/notification`, {
    ...params,
    pageIndex: params?.current
  });
};

export const sendNovelNotificationApi = (data: {
  userId?: number;
  title: string;
  content: string;
}) => {
  return request.post<object>(`/admin-api/v1/app/novel/notification`, data);
};

export const delNovelNotificationApi = (ids: number[]) => {
  return request.delete<object>(`/admin-api/v1/app/novel/notification`, { ids });
};