export interface IAchievements {
  achievements: AchievementsData;
  seotag: SeoTag;
}

export interface AchievementsData {
  current_page: number;
  data: Achievement[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Achievement {
  id: number;
  main_image: string;
  alt_image: string;
  active_status: number;
}

export interface Link {
  url: string | null;
  label: string;
  active: boolean;
}

export interface SeoTag {
  meta_title: string;
  meta_description: string;
  page_name: string;
}
