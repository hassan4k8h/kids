import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import BroadcastService, { BroadcastResponse, BroadcastOptions } from '../../services/BroadcastService';
import AudienceService, { AudienceResponse } from '../../services/AudienceService';
import { Send, Calendar, Users, Mail, Trash2, Eye, Plus } from 'lucide-react';

interface BroadcastManagerProps {
  isAdmin?: boolean;
}

const BroadcastManager: React.FC<BroadcastManagerProps> = ({ isAdmin = false }) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastResponse[]>([]);
  const [audiences, setAudiences] = useState<AudienceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [newBroadcast, setNewBroadcast] = useState<BroadcastOptions>({
    audienceId: '',
    from: 'Kids Educational Game <noreply@kidsgame.com>',
    subject: '',
    html: ''
  });
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastResponse | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadBroadcasts();
      loadAudiences();
    }
  }, [isAdmin]);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await BroadcastService.listBroadcasts();
      if (data) {
        setBroadcasts(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في تحميل قائمة البث' });
    } finally {
      setLoading(false);
    }
  };

  const loadAudiences = async () => {
    try {
      const data = await AudienceService.listAudiences();
      if (data) {
        setAudiences(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في تحميل قائمة الجماهير' });
    }
  };

  const handleCreateBroadcast = async () => {
    if (!newBroadcast.audienceId || !newBroadcast.subject || !newBroadcast.html) {
      setMessage({ type: 'error', text: 'يرجى ملء جميع الحقول المطلوبة' });
      return;
    }

    setLoading(true);
    try {
      const broadcastData = {
        ...newBroadcast,
        ...(scheduledAt && { scheduledAt })
      };
      
      const result = await BroadcastService.createBroadcast(broadcastData);
      if (result) {
        setMessage({ type: 'success', text: 'تم إنشاء البث بنجاح!' });
        setNewBroadcast({
          audienceId: '',
          from: 'Kids Educational Game <noreply@kidsgame.com>',
          subject: '',
          html: ''
        });
        setScheduledAt('');
        loadBroadcasts();
      } else {
        setMessage({ type: 'error', text: 'فشل في إنشاء البث' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إنشاء البث' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (broadcastId: string, scheduleTime?: string) => {
    setLoading(true);
    try {
      const result = await BroadcastService.sendBroadcast(
        broadcastId,
        scheduleTime ? { scheduledAt: scheduleTime } : undefined
      );
      
      if (result) {
        setMessage({ 
          type: 'success', 
          text: scheduleTime ? 'تم جدولة البث بنجاح!' : 'تم إرسال البث بنجاح!' 
        });
        loadBroadcasts();
      } else {
        setMessage({ type: 'error', text: 'فشل في إرسال البث' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال البث' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBroadcast = async (broadcastId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البث؟')) return;
    
    setLoading(true);
    try {
      const result = await BroadcastService.deleteBroadcast(broadcastId);
      if (result) {
        setMessage({ type: 'success', text: 'تم حذف البث بنجاح!' });
        loadBroadcasts();
      } else {
        setMessage({ type: 'error', text: 'فشل في حذف البث' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حذف البث' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWelcomeBroadcast = async () => {
    if (!audiences.length) {
      setMessage({ type: 'error', text: 'لا توجد جماهير متاحة' });
      return;
    }

    setLoading(true);
    try {
      const mainAudience = audiences[0]; // Use first audience or main audience
      const result = await BroadcastService.sendWelcomeBroadcast(mainAudience.id);
      
      if (result) {
        setMessage({ type: 'success', text: 'تم إرسال بث الترحيب بنجاح!' });
        loadBroadcasts();
      } else {
        setMessage({ type: 'error', text: 'فشل في إرسال بث الترحيب' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال بث الترحيب' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWeeklyDigest = async (scheduleTime?: string) => {
    if (!audiences.length) {
      setMessage({ type: 'error', text: 'لا توجد جماهير متاحة' });
      return;
    }

    setLoading(true);
    try {
      const mainAudience = audiences[0]; // Use first audience or main audience
      const result = await BroadcastService.sendWeeklyDigest(mainAudience.id, scheduleTime);
      
      if (result) {
        setMessage({ 
          type: 'success', 
          text: scheduleTime ? 'تم جدولة الملخص الأسبوعي بنجاح!' : 'تم إرسال الملخص الأسبوعي بنجاح!' 
        });
        loadBroadcasts();
      } else {
        setMessage({ type: 'error', text: 'فشل في إرسال الملخص الأسبوعي' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال الملخص الأسبوعي' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { color: 'bg-gray-500', text: 'مسودة' },
      'scheduled': { color: 'bg-blue-500', text: 'مجدول' },
      'sent': { color: 'bg-green-500', text: 'تم الإرسال' },
      'failed': { color: 'bg-red-500', text: 'فشل' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'bg-gray-500', text: status };
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.text}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertDescription>
          ليس لديك صلاحية للوصول إلى إدارة البث الجماعي.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة البث الجماعي</h1>
        <div className="flex gap-2">
          <Button onClick={handleSendWelcomeBroadcast} disabled={loading}>
            <Mail className="w-4 h-4 mr-2" />
            بث ترحيب
          </Button>
          <Button onClick={() => handleSendWeeklyDigest()} disabled={loading}>
            <Calendar className="w-4 h-4 mr-2" />
            ملخص أسبوعي
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">إنشاء بث جديد</TabsTrigger>
          <TabsTrigger value="manage">إدارة البث</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                إنشاء بث جديد
              </CardTitle>
              <CardDescription>
                قم بإنشاء بث جماعي جديد لإرساله إلى المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الجمهور المستهدف</label>
                  <Select
                    value={newBroadcast.audienceId}
                    onValueChange={(value) => setNewBroadcast({ ...newBroadcast, audienceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجمهور" />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((audience) => (
                        <SelectItem key={audience.id} value={audience.id}>
                          {audience.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">من (اختياري)</label>
                  <Input
                    value={newBroadcast.from}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, from: e.target.value })}
                    placeholder="Kids Educational Game <noreply@kidsgame.com>"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">موضوع البريد الإلكتروني</label>
                <Input
                  value={newBroadcast.subject}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, subject: e.target.value })}
                  placeholder="أدخل موضوع البريد الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">محتوى البريد الإلكتروني (HTML)</label>
                <Textarea
                  value={newBroadcast.html}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, html: e.target.value })}
                  placeholder="أدخل محتوى البريد الإلكتروني بصيغة HTML"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">جدولة الإرسال (اختياري)</label>
                <Input
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  placeholder="مثال: in 1 hour, tomorrow at 9am, 2024-08-05T11:52:01.858Z"
                />
              </div>

              <Button onClick={handleCreateBroadcast} disabled={loading} className="w-full">
                {loading ? 'جاري الإنشاء...' : 'إنشاء البث'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                قائمة البث الجماعي
              </CardTitle>
              <CardDescription>
                إدارة وعرض جميع البث الجماعي المنشأ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">جاري التحميل...</p>
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد بث جماعي منشأ بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {broadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{broadcast.subject}</h3>
                        {getStatusBadge(broadcast.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>من: {broadcast.from}</p>
                        <p>تاريخ الإنشاء: {new Date(broadcast.createdAt).toLocaleDateString('ar-SA')}</p>
                        {broadcast.scheduledAt && (
                          <p>مجدول لـ: {new Date(broadcast.scheduledAt).toLocaleDateString('ar-SA')}</p>
                        )}
                        {broadcast.sentAt && (
                          <p>تم الإرسال في: {new Date(broadcast.sentAt).toLocaleDateString('ar-SA')}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBroadcast(broadcast)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          عرض
                        </Button>
                        
                        {broadcast.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendBroadcast(broadcast.id)}
                            disabled={loading}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            إرسال الآن
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBroadcast(broadcast.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Broadcast Preview Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">معاينة البث</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBroadcast(null)}
                >
                  إغلاق
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong>الموضوع:</strong> {selectedBroadcast.subject}
                </div>
                <div>
                  <strong>من:</strong> {selectedBroadcast.from}
                </div>
                <div>
                  <strong>الحالة:</strong> {getStatusBadge(selectedBroadcast.status)}
                </div>
                <div>
                  <strong>المحتوى:</strong>
                  <div 
                    className="border rounded p-4 mt-2 bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: selectedBroadcast.html }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastManager;