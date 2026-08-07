import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelFeedbackModel {
  id?: number;
  userId?: number;
  userName?: string;
  type?: string;
  typeLabel?: string;
  kind?: string;
  content?: string;
  status?: string;
  createdAt?: string;
}

export interface NovelFeedbackQuery extends ReqPage {
  kind?: string;
  type?: string;
  keyword?: string;
}

export const getNovelFeedbackPageApi = (params: NovelFeedbackQuery) => {
  return request.get<ResPage<NovelFeedbackModel>>(`/admin-api/v1/app/novel/feedback`, {
    ...params,
    pageIndex: params?.current
  });
};

export const delNovelFeedbackApi = (ids: number[]) => {
  return request.delete<object>(`/admin-api/v1/app/novel/feedback`, { ids });
};
