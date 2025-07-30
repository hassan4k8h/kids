import { Switch } from "../ui/switch";
import { Volume2 } from "lucide-react";

interface AudioSettingsProps {
  isRTL: boolean;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
  onSettingsChange: (key: string, value: any) => void;
}

export function AudioSettings({ isRTL, settings, onSettingsChange }: AudioSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Sound Effects */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Volume2 className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "المؤثرات الصوتية" : "Sound Effects"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "أصوات اللعب والتفاعل" : "Game and interaction sounds"}
            </p>
          </div>
        </div>
        <Switch
          checked={settings.soundEnabled}
          onCheckedChange={(checked) => onSettingsChange('soundEnabled', checked)}
        />
      </div>

      {/* Background Music */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Volume2 className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "الموسيقى الخلفية" : "Background Music"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "موسيقى أثناء اللعب" : "Music during gameplay"}
            </p>
          </div>
        </div>
        <Switch
          checked={settings.musicEnabled}
          onCheckedChange={(checked) => onSettingsChange('musicEnabled', checked)}
        />
      </div>
    </div>
  );
}