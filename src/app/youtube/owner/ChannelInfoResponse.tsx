export interface ChannelInfoResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items?: ChannelInfo[];
}

export interface ChannelInfo {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: Thumbnail;
      medium: Thumbnail;
      high: Thumbnail;
    };
    localized: {
      title: string;
      description: string;
    };
    country: string;
  };
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}
