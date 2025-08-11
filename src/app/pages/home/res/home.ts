export interface IHome {
  slider: Slider;
  aboutHome: AboutHome;
  clients: Client[];
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
}

export interface Slider {
  id: number;
  title: string;
  main_image: string;
  alt_image: string;
}

export interface AboutHome {
  main_title: string;
  main_text: string;
  about_title: string;
  about_text: string;
}

export interface Client {
  client_name: string;
  main_image: string;
  alt_image: string;
  active_status: number;
}

export interface Service {
  title: string;
  small_text: string;
  main_image: string;
  alt_image: string;
  active_status: number;
  slug: string;
}

export interface Project {
  title: string;
  main_image: string;
  alt_image: string;
  slug: string;
  active_status: number;
}

export interface Testimonial {
  job: string;
  text: string;
  active_status: number;
}
