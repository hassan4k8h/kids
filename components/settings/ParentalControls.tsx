import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Mail } from "lucide-react";
import { PLAY_TIME_OPTIONS } from "../../constants/settings";
import { User } from "../../types/Auth";

interface ParentalControlsProps {
  isRTL: boolean;
  user: User;
  settings: {
    maxPlayTime: number;
    reportingEnabled: boolean;
  };
  onSettingsChange: (key: string, value: any) => void;
}

export function ParentalControls({ isRTL, user, settings, onSettingsChange }: ParentalControlsProps) {
  return (
    <div className="space-y-6">
      {/* Daily Play Time */}
      <div className="py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "وقت اللعب اليومي" : "Daily Play Time"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "الحد الأقصى بالدقائق" : "Maximum time in minutes"}
            </p>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {settings.maxPlayTime === 999 ? '∞' : settings.maxPlayTime} {isRTL ? 'د' : 'm'}
          </div>
        </div>
        <Select 
          value={settings.maxPlayTime.toString()} 
          onValueChange={(value) => onSettingsChange('maxPlayTime', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAY_TIME_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {isRTL ? option.labelAr : option.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Reporting */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-800">
            {isRTL ? "تقارير التقدم" : "Progress Reports"}
          </h3>
          <p className="text-sm text-gray-600">
            {isRTL ? "إرسال تقارير أسبوعية" : "Send weekly reports"}
          </p>
        </div>
        <Switch
          checked={settings.reportingEnabled}
          onCheckedChange={(checked) => onSettingsChange('reportingEnabled', checked)}
        />
      </div>

      {/* Parent Email */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-700 mb-2">
          <Mail className="w-5 h-5" />
          <span className="font-semibold">
            {isRTL ? "بريد الوالدين" : "Parent Email"}
          </span>
        </div>
        <p className="text-sm text-yellow-600">
          {user.email}
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          {isRTL 
            ? "سيتم إرسال التقارير والإشعارات إلى هذا البريد"
            : "Reports and notifications will be sent to this email"
          }
        </p>
      </div>
    </div>
  );
}