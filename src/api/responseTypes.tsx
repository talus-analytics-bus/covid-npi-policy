/**
 * Fields for a typical API response, possibly including pagination info.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  /**
   * The number of elements in all pages of the data.
   */
  n?: number | null;
  next_page_url?: string | null;
}
export interface ApiResponseIndexed<T> {
  data: { [k: string]: T[] };
  success: boolean;
  message: string;
  /**
   * The number of elements in all pages of the data.
   */
  n?: number | null;
  next_page_url?: string | null;
}
