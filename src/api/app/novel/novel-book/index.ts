import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelBookModel {
  id?: number;
  title?: string;
  author?: string;
  cover?: string;
  rating?: number;
  reviewCount?: number;
  serialStatus?: string;
  category?: string;
  categoryName?: string;
  tags?: string[];
  slogan?: string;
  description?: string;
  clicks?: number;
  wordCount?: number;
  chapters?: number;
  publishDate?: string;
  readUrl?: string;
  isFeatured?: number;
  status?: string;
  createdAt?: Date;
}

export interface NovelBookQuery extends ReqPage {
  keyword?: string;
  category?: string;
  status?: string;
  serialStatus?: string;
}

export const getNovelBookPageApi = (params: NovelBookQuery) => {
  return request.get<ResPage<NovelBookModel>>(`/admin-api/v1/app/novel/book`, {
    ...params,
    pageIndex: params?.current,
    allStatus: true
  });
};

export const mergeNovelBookApi = (data: { sourceBookId: number; targetBookId: number }) => {
  return request.post<object>(`/admin-api/v1/app/novel/book/merge`, data);
};

export const updateNovelBookApi = (id: number, data: object) => {
  return request.put<object>(`/admin-api/v1/app/novel/book/${id}`, data);
};

export const deleteNovelBookApi = (ids: number[]) => {
  return request.delete<object>(`/admin-api/v1/app/novel/book`, { ids });
};
