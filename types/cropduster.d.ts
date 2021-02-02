export interface CDResponse {
  data: string;
}

declare namespace CD {
  function get(url: string, options: Record<string, unknown>): Promise<CDResponse>;
  function _hashForRequest(url: string, options: Record<string, unknown>): string;
}

export default CD;
