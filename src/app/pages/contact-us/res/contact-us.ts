export interface IContactUs {
  contact: Contact;
}

export interface Contact {
  first_phone: string;
  second_phone: string;
  whatsapp_phone: string;
  main_email: string;
  office_address: string;
  office_map_link: string;
  office_working_hours: string;
  facebook_link: any;
  instagram_link: any;
  twitter_link: any;
  linkedin_link: any;
  youtube_link: any;
  snapchat_link: any;
  telegram_link: any;
  tiktok_link: any;
}

export interface IContactUsForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface IBookCall {
  name: string;
  email: string;
  phone: string;
  free_time: string;
}
