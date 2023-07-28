import cartolaApi from "@/services/cartolaApi";
import Cookies from "js-cookie";

export const api = {
  get: <T>(url: string, params?: object) =>
    cartolaApi.get<T>(url, {
      headers: {
        token: Cookies.get("token"),
      },
      ...params,
    }),
  post: <T>(url: string, data: any) =>
    cartolaApi.post<T>(url, data, {
      headers: {
        token: Cookies.get("token"),
      },
    }),
  patch: <T>(url: string, data: any) =>
    cartolaApi.patch<T>(url, data, {
      headers: {
        token: Cookies.get("token"),
      },
    }),
  delete: <T>(url: string) =>
    cartolaApi.delete<T>(url, {
      headers: {
        token: Cookies.get("token"),
      },
    }),
};
