import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";

export interface NovelUserModel {
  id?: number;
  userId?: number;
  nickname?: string;
  avatar?: string;
  bio?: string;
  userName?: string;
  mobile?: string;
  status?: string;
  banPostUntil?: string;
  banReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NovelUserQuery extends ReqPage {
  keyword?: string;
  status?: string;
}

export const getNovelUserPageApi = (params: NovelUserQuery) => {
  return request.get<ResPage<NovelUserModel>>(`/admin-api/v1/app/novel/user`, {
    ...params,
    pageIndex: params?.current
  });
};

export const changeNovelUserStatusApi = (id: number, status: string) => {
  return request.put<object>(`/admin-api/v1/app/novel/user/${id}/status`, { status });
};

export const banNovelUserPostApi = (id: number, data: { banUntil?: string | null; reason?: string }) => {
  return request.put<object>(`/admin-api/v1/app/novel/user/${id}/ban-post`, data);
};
