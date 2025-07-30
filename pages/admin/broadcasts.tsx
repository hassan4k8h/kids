import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import BroadcastManager from '../../components/admin/BroadcastManager';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Mail, Users, Send, Calendar } from 'lucide-react';

const BroadcastsPage: React.FC = () => {
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
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">إدارة البث الجماعي</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            قم بإنشاء وإدارة حملات البريد الإلكتروني الجماعية لإرسال الرسائل والتحديثات إلى المستخدمين.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إنشاء البث</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">إنشاء</div>
              <p className="text-xs text-muted-foreground">
                إنشاء حملات بريد إلكتروني جديدة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الجدولة</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">جدولة</div>
              <p className="text-xs text-muted-foreground">
                جدولة الإرسال في أوقات محددة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إدارة الجماهير</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">إدارة</div>
              <p className="text-xs text-muted-foreground">
                إدارة قوائم المستخدمين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التتبع</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">تتبع</div>
              <p className="text-xs text-muted-foreground">
                تتبع حالة الإرسال والتسليم
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Broadcast Manager Component */}
        <BroadcastManager isAdmin={isAdmin} />
      </div>
    </Layout>
  );
};



export default BroadcastsPage;