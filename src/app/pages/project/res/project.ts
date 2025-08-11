export interface IProject {
  projects: Project[];
}

export interface Project {
  title: string;
  main_image: string;
  alt_image: string;
  slug: string;
  active_status: number;
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
