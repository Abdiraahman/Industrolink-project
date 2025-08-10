export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  bio: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  studentMessages: boolean;
  evaluationReminders: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
}

export type SettingsTab = 'profile' | 'notifications' | 'security';