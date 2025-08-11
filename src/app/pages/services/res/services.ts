export interface IService {
  services: Services;
}

export interface Services {
  current_page: number;
  data: Daum[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: any;
  path: string;
  per_page: number;
  prev_page_url: any;
  to: number;
  total: number;
}

export interface Daum {
  title: string;
  small_text: string;
  main_image: string;
  alt_image: string;
  active_status: number;
  slug: string;
  id: number;
}

export interface Link {
  url?: string;
  label: string;
  active: boolean;
}

export interface ServiceResponse {
  service: singleService;
}

export interface singleService {
  title: string;
  small_text: string;
  main_text: string;
  main_image: string;
  alt_image: string;
  script: string;
  meta_title: string;
  meta_description: string;
  slug: string;
  active_status: number; // If it's strictly 0 or 1, you could use: 0 | 1
}
