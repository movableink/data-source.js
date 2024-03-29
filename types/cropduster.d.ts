export interface CDResponse {
  data: string;
}

declare namespace CD {
  function get(url: string, options: Record<string, unknown>): Promise<CDResponse>;
}

export default CD;
