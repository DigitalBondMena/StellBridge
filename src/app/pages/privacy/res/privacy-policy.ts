export interface IPrivacyPolicy {
  success: boolean;
  message: string;
  date: PrivacyPolicyData;
}

export interface PrivacyPolicyData {
  id: number;
  en_title: string;
  en_description: string;
  created_at: any;
  updated_at: string;
}
