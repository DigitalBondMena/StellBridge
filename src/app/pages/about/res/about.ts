import { Client } from '../../home/res/home';

export interface IAbout {
  about: About;
  clients: Client[];
}

export interface About {
  main_title: string;
  main_text: string;
  main_image: string;
  alt_image: string;
  about_title: string;
  about_text: string;
  about_image: string;
  about_alt_image: string;
  commitment_text: string;
  mission_text: string;
  vision_text: string;
}
