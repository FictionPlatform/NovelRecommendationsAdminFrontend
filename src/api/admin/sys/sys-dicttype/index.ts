import request from "@/utils/request";
import { ReqPage, ResPage } from "@/utils/request/interface";
import { store } from "@/redux";
import { setDictList } from "@/redux/modules/global/action";

export interface DictTypeModel {
  id?: number;
  dictName?: string;
  dictType?: string;
  status?: string;
  remark?: string;
  createBy?: number;
  updateBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getDictTypePageApi = (params: ReqPage) => {
  return request.get<ResPage<DictTypeModel>>(`/admin-api/v1/admin/sys/sys-dict/type`, { ...params, pageIndex: params?.current });
};

export const getDictTypeApi = (id: number) => {
  return request.get<DictTypeModel>(`/admin-api/v1/admin/sys/sys-dict/type/` + id);
};

export const getAllDictTypesApi = () => {
  return request.get<DictTypeModel[]>(`/admin-api/v1/admin/sys/sys-dict/type/option-select`);
};

export const addDictTypeApi = (data: object) => {
  return request.post<object>(`/admin-api/v1/admin/sys/sys-dict/type`, data);
};

export const updateDictTypeApi = (id: number, data: object) => {
  return request.put<object>("/admin-api/v1/admin/sys/sys-dict/type/" + id, data);
};

export const delDictTypeApi = (params: number[]) => {
  return request.delete<object>(`/admin-api/v1/admin/sys/sys-dict/type`, { ids: params });
};

export const exportDictTypeApi = (query: object) => {
  return request.download(`/admin-api/v1/admin/sys/sys-dict/type/export`, query);
};

export interface DictTypeWithDataModel {
  id?: number;
  dict_type?: string;
  dict_name?: string;
  dictData?: {
    id?: number;
    dict_type?: string;
    dict_label?: string;
    dict_value?: string;
    status?: string;
  }[];
}

export const getAllDictTypeWithDataApi = (_object = {}) => {
  return request.get<DictTypeWithDataModel[]>(`/admin-api/v1/admin/sys/sys-dict/type/all-with-data`, {}, _object);
};

// * 刷新全局字典缓存（global.dictList），字典类型/字典数据增删改后调用，避免其他页面下拉取到旧数据
export const refreshDictList = async () => {
  const { data } = await getAllDictTypeWithDataApi({ headers: { noLoading: true } });
  store.dispatch(setDictList(data));
};

// export const getDictOptions = (datas: DictDataModel[]) => {
//   return new Map(datas.map(({ dictValue, dictLabel }) => [dictValue || "", dictLabel || ""]));
// };

export const getDictOptions = (type: string) => {
  const dictList = store.getState().global.dictList as DictTypeWithDataModel[];
  const dict = dictList.find(item => item.dict_type === type);
  const dictData = dict?.dictData || [];
  return new Map(dictData.map(({ dict_value, dict_label }) => [dict_value || "", dict_label || ""]));
};