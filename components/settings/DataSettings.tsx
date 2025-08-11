import { Button } from "../ui/button";
import { Download, Trash2 } from "lucide-react";
import { Player } from "../../types/Player";

interface DataSettingsProps {
  isRTL: boolean;
  player: Player;
  onExportData: () => void;
  onShowDeleteConfirm: () => void;
}

export function DataSettings({ isRTL, player, onExportData, onShowDeleteConfirm }: DataSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Export Data */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800 mb-1">
              {isRTL ? "تصدير البيانات" : "Export Data"}
            </h3>
            <p className="text-sm text-green-600">
              {isRTL ? "تحميل نسخة من بيانات اللاعب" : "Download a copy of player data"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onExportData}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            <Download className="w-4 h-4 mr-2" />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-3">
          {isRTL ? "معلومات التخزين" : "Storage Information"}
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex justify-between">
            <span>{isRTL ? "نقاط اللعب:" : "Game Points:"}</span>
            <span className="font-medium">{player.totalScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{isRTL ? "الألعاب المكتملة:" : "Games Completed:"}</span>
            <span className="font-medium">{player.gamesCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span>{isRTL ? "القصص المكتملة:" : "Stories Completed:"}</span>
            <span className="font-medium">{player.storiesCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span>{isRTL ? "تاريخ الإنشاء:" : "Created:"}</span>
            <span className="font-medium">
              {new Date(player.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-800 mb-1">
              {isRTL ? "حذف الحساب" : "Delete Account"}
            </h3>
            <p className="text-sm text-red-600">
              {isRTL ? "حذف الحساب نهائياً مع جميع البيانات" : "Permanently delete account and all data"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onShowDeleteConfirm}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isRTL ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}