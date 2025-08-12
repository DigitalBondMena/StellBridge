export interface IProjects {
  projects: Projects;
  seotag: Seotag;
}

export interface Projects {
  current_page: number;
  data: projectData[];
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

export interface projectData {
  id: number;
  title: string;
  main_image: string;
  alt_image: string;
  slug: string;
  active_status: number;
}

export interface Link {
  url?: string;
  label: string;
  active: boolean;
}

export interface Seotag {
  meta_title: string;
  meta_description: string;
  page_name: string;
}

export interface ProjectDetails {
  project: ProjectData;
}

export interface ProjectData {
  title: string;
  main_text: string;
  main_image: string;
  alt_image: string;
  meta_title: string;
  meta_description: string;
  script: string;
  slug: string;
  active_status: number;
  id: number;
  projectimagesactive: Projectimagesactive[];
}

export interface Projectimagesactive {
  id: number;
  project_id: number;
  en_alt_name: string;
  main_image: string;
  active_status: number;
  created_at: string;
  updated_at: string;
}
