import { get, post, put, del } from '@/app/lib/request';
import type { ApiResponse, Tag, Location } from '@/app/types';

// --- Tags ---

export const getTags = () => {
  return get<ApiResponse<Tag[]>>('/tags');
};

export const createTag = (name: string) => {
  return post<ApiResponse<Tag>>('/tags', { name });
};

export const updateTag = (id: number, name: string) => {
  return put<ApiResponse<Tag>>(`/tags/${id}`, { name });
};

export const deleteTag = (id: number) => {
  return del<ApiResponse<void>>(`/tags/${id}`);
};

// --- Locations ---

export const getLocations = () => {
  return get<ApiResponse<Location[]>>('/locations');
};

export const createLocation = (name: string, description?: string) => {
  return post<ApiResponse<Location>>('/locations', { name, description });
};

export const updateLocation = (id: number, name: string, description?: string) => {
  return put<ApiResponse<Location>>(`/locations/${id}`, { name, description });
};

export const deleteLocation = (id: number) => {
  return del<ApiResponse<void>>(`/locations/${id}`);
};
