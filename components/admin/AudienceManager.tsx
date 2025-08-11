import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import AudienceService, { AudienceResponse, ContactResponse, AudienceOptions, ContactOptions } from '../../services/AudienceService';
import { Users, UserPlus, Trash2, Plus, Mail, Search } from 'lucide-react';

interface AudienceManagerProps {
  isAdmin?: boolean;
}

const AudienceManager: React.FC<AudienceManagerProps> = ({ isAdmin = false }) => {
  const [audiences, setAudiences] = useState<AudienceResponse[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<AudienceResponse | null>(null);
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [newAudience, setNewAudience] = useState<AudienceOptions>({
    name: ''
  });
  const [newContact, setNewContact] = useState<ContactOptions>({
    email: '',
    firstName: '',
    lastName: '',
    unsubscribed: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadAudiences();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedAudience) {
      loadContacts(selectedAudience.id);
    }
  }, [selectedAudience]);

  const loadAudiences = async () => {
    setLoading(true);
    try {
      const data = await AudienceService.listAudiences();
      if (data) {
        setAudiences(data);
        // Auto-select first audience if none selected
        if (!selectedAudience && data.length > 0) {
          setSelectedAudience(data[0]);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في تحميل قائمة الجماهير' });
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async (audienceId: string) => {
    setLoading(true);
    try {
      const data = await AudienceService.listContacts(audienceId);
      if (data) {
        setContacts(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في تحميل قائمة جهات الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudience = async () => {
    if (!newAudience.name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم الجمهور' });
      return;
    }

    setLoading(true);
    try {
      const result = await AudienceService.createAudience(newAudience);
      if (result) {
        setMessage({ type: 'success', text: 'تم إنشاء الجمهور بنجاح!' });
        setNewAudience({ name: '' });
        loadAudiences();
      } else {
        setMessage({ type: 'error', text: 'فشل في إنشاء الجمهور' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إنشاء الجمهور' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudience = async (audienceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجمهور؟ سيتم حذف جميع جهات الاتصال المرتبطة به.')) return;
    
    setLoading(true);
    try {
      const result = await AudienceService.deleteAudience(audienceId);
      if (result) {
        setMessage({ type: 'success', text: 'تم حذف الجمهور بنجاح!' });
        if (selectedAudience?.id === audienceId) {
          setSelectedAudience(null);
          setContacts([]);
        }
        loadAudiences();
      } else {
        setMessage({ type: 'error', text: 'فشل في حذف الجمهور' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حذف الجمهور' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!selectedAudience) {
      setMessage({ type: 'error', text: 'يرجى اختيار جمهور أولاً' });
      return;
    }

    if (!newContact.email.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال البريد الإلكتروني' });
      return;
    }

    setLoading(true);
    try {
      const result = await AudienceService.addContact(selectedAudience.id, newContact);
      if (result) {
        setMessage({ type: 'success', text: 'تم إضافة جهة الاتصال بنجاح!' });
        setNewContact({
          email: '',
          firstName: '',
          lastName: '',
          unsubscribed: false
        });
        loadContacts(selectedAudience.id);
      } else {
        setMessage({ type: 'error', text: 'فشل في إضافة جهة الاتصال' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إضافة جهة الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!selectedAudience) return;
    if (!confirm('هل أنت متأكد من حذف جهة الاتصال هذه؟')) return;
    
    setLoading(true);
    try {
      const result = await AudienceService.removeContact(selectedAudience.id, contactId);
      if (result) {
        setMessage({ type: 'success', text: 'تم حذف جهة الاتصال بنجاح!' });
        loadContacts(selectedAudience.id);
      } else {
        setMessage({ type: 'error', text: 'فشل في حذف جهة الاتصال' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حذف جهة الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeUser = async (email: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    try {
      const result = await AudienceService.subscribeUser(email, firstName, lastName);
      if (result) {
        setMessage({ type: 'success', text: 'تم اشتراك المستخدم بنجاح!' });
        // Refresh the main audience if it's selected
        const mainAudience = audiences.find(a => a.name === 'Kids Educational Game Users');
        if (mainAudience && selectedAudience?.id === mainAudience.id) {
          loadContacts(mainAudience.id);
        }
      } else {
        setMessage({ type: 'error', text: 'فشل في اشتراك المستخدم' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء اشتراك المستخدم' });
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.firstName && contact.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.lastName && contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin) {
    return (
      <Alert>
        <AlertDescription>
          ليس لديك صلاحية للوصول إلى إدارة الجماهير.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الجماهير</h1>
        <Button onClick={() => handleSubscribeUser('test@example.com', 'Test', 'User')} disabled={loading}>
          <UserPlus className="w-4 h-4 mr-2" />
          اشتراك تجريبي
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audiences List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              قائمة الجماهير
            </CardTitle>
            <CardDescription>
              إدارة مجموعات المستخدمين
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Audience */}
            <div className="space-y-2">
              <Input
                value={newAudience.name}
                onChange={(e) => setNewAudience({ name: e.target.value })}
                placeholder="اسم الجمهور الجديد"
              />
              <Button onClick={handleCreateAudience} disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                إنشاء جمهور
              </Button>
            </div>

            {/* Audiences List */}
            <div className="space-y-2">
              {loading && audiences.length === 0 ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : audiences.length === 0 ? (
                <p className="text-gray-500 text-center py-4">لا توجد جماهير</p>
              ) : (
                audiences.map((audience) => (
                  <div
                    key={audience.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAudience?.id === audience.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAudience(audience)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{audience.name}</h3>
                        <p className="text-sm text-gray-500">
                          تم الإنشاء: {new Date(audience.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAudience(audience.id);
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              جهات الاتصال
              {selectedAudience && (
                <Badge variant="outline">
                  {selectedAudience.name}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              إدارة جهات الاتصال في الجمهور المحدد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAudience ? (
              <>
                {/* Add New Contact */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                    type="email"
                  />
                  <Input
                    value={newContact.firstName}
                    onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    placeholder="الاسم الأول"
                  />
                  <Input
                    value={newContact.lastName}
                    onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    placeholder="الاسم الأخير"
                  />
                  <Button onClick={handleAddContact} disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    إضافة
                  </Button>
                </div>

                {/* Search Contacts */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="البحث في جهات الاتصال..."
                    className="pl-10"
                  />
                </div>

                {/* Contacts List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">جاري التحميل...</p>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد جهات اتصال في هذا الجمهور'}
                      </p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contact.email}</span>
                            {contact.unsubscribed && (
                              <Badge variant="destructive">ملغي الاشتراك</Badge>
                            )}
                          </div>
                          {(contact.firstName || contact.lastName) && (
                            <p className="text-sm text-gray-600">
                              {contact.firstName} {contact.lastName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            تم الإنشاء: {new Date(contact.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveContact(contact.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">اختر جمهوراً لعرض جهات الاتصال</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AudienceManager;