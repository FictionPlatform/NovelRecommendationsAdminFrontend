import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelCategoryModel {
  id?: number;
  name?: string;
  sort?: number;
  status?: string;
  tagCount?: number;
  createBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NovelCategoryQuery extends ReqPage {
  name?: string;
  status?: string;
}

export const getNovelCategoryPageApi = (params: NovelCategoryQuery) => {
  return request.get<ResPage<NovelCategoryModel>>(`/admin-api/v1/app/novel/category`, {
    ...params,
    pageIndex: params?.current
  });
};

export const addNovelCategoryApi = (data: object) => {
  return request.post<object>(`/admin-api/v1/app/novel/category`, data);
};

export const updateNovelCategoryApi = (id: number, data: object) => {
  return request.put<object>(`/admin-api/v1/app/novel/category/${id}`, data);
};

export const delNovelCategoryApi = (ids: number[]) => {
  return request.delete<object>(`/admin-api/v1/app/novel/category`, { ids });
};
