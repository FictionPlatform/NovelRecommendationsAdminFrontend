import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelTagModel {
  id?: number;
  categoryId?: number;
  category?: string;
  name?: string;
  sort?: number;
  status?: string;
  createBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NovelTagQuery extends ReqPage {
  categoryId?: number;
  name?: string;
  status?: string;
}

export const getNovelTagPageApi = (params: NovelTagQuery) => {
  return request.get<ResPage<NovelTagModel>>(`/admin-api/v1/app/novel/tag`, {
    ...params,
    pageIndex: params?.current
  });
};

export const addNovelTagApi = (data: object) => {
  return request.post<object>(`/admin-api/v1/app/novel/tag`, data);
};

export const updateNovelTagApi = (id: number, data: object) => {
  return request.put<object>(`/admin-api/v1/app/novel/tag/${id}`, data);
};

export const delNovelTagApi = (ids: number[]) => {
  return request.delete<object>(`/admin-api/v1/app/novel/tag`, { ids });
};
