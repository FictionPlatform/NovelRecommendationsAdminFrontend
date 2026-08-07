import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelPostModel {
  id?: number;
  userId?: number;
  userName?: string;
  userAvatar?: string;
  title?: string;
  content?: string;
  summary?: string;
  wordCount?: number;
  readTime?: number;
  topicTag?: string;
  refBookId?: number;
  likes?: number;
  dislikes?: number;
  collections?: number;
  commentCount?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NovelPostQuery extends ReqPage {
  keyword?: string;
  status?: string;
}

export const getNovelPostPageApi = (params: NovelPostQuery) => {
  return request.get<ResPage<NovelPostModel>>(`/admin-api/v1/app/novel/post`, {
    ...params,
    pageIndex: params?.current
  });
};

export const changeNovelPostStatusApi = (id: number, status: string) => {
  return request.put<object>(`/admin-api/v1/app/novel/post/${id}/status`, { status });
};
