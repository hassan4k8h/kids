import { Settings, Volume2, User, Shield, Download, Globe, Bell, Users, LogOut, Trash2, Mail, Crown, CheckCircle } from "lucide-react";

export const SETTINGS_SECTIONS = [
  { id: 'general', labelAr: 'عام', labelEn: 'General', icon: Settings },
  { id: 'audio', labelAr: 'الصوت', labelEn: 'Audio', icon: Volume2 },
  { id: 'account', labelAr: 'الحساب', labelEn: 'Account', icon: User },
  { id: 'parental', labelAr: 'الرقابة الأبوية', labelEn: 'Parental Controls', icon: Shield },
  { id: 'data', labelAr: 'البيانات', labelEn: 'Data', icon: Download },
] as const;

export const PLAY_TIME_OPTIONS = [
  { value: '30', labelAr: '30 دقيقة', labelEn: '30 minutes' },
  { value: '60', labelAr: '60 دقيقة', labelEn: '60 minutes' },
  { value: '90', labelAr: '90 دقيقة', labelEn: '90 minutes' },
  { value: '120', labelAr: '120 دقيقة', labelEn: '120 minutes' },
  { value: '180', labelAr: '180 دقيقة', labelEn: '180 minutes' },
  { value: '999', labelAr: 'بلا حدود', labelEn: 'Unlimited' }
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' }
] as const;

export type SettingsSectionId = typeof SETTINGS_SECTIONS[number]['id'];