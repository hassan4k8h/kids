import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AudienceManager from '../../components/admin/AudienceManager';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, UserPlus, Mail, Database } from 'lucide-react';

const AudiencesPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (you can implement your own logic here)
    const checkAdminStatus = () => {
      // For now, assume user is admin
      setIsAdmin(true);
    };
    checkAdminStatus();
  }, []);
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">إدارة الجماهير</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            قم بإنشاء وإدارة مجموعات المستخدمين وجهات الاتصال لحملات البريد الإلكتروني.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إنشاء الجماهير</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">إنشاء</div>
              <p className="text-xs text-muted-foreground">
                إنشاء مجموعات مستخدمين جديدة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إضافة جهات الاتصال</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">إضافة</div>
              <p className="text-xs text-muted-foreground">
                إضافة مستخدمين جدد للقوائم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إدارة البيانات</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">إدارة</div>
              <p className="text-xs text-muted-foreground">
                تنظيم وإدارة بيانات المستخدمين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاشتراكات</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">اشتراك</div>
              <p className="text-xs text-muted-foreground">
                إدارة اشتراكات البريد الإلكتروني
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Audience Manager Component */}
        <AudienceManager isAdmin={isAdmin} />
      </div>
    </Layout>
  );
};



export default AudiencesPage;