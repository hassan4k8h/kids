import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Mail, 
  Users, 
  Send, 
  Database, 
  Settings, 
  BarChart3, 
  Shield,
  Activity
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (you can implement your own logic here)
    const checkAdminStatus = () => {
      // For now, assume user is admin
      setIsAdmin(true);
    };
    checkAdminStatus();
  }, []);
  const adminTools = [
    {
      title: 'إدارة البث الجماعي',
      description: 'إنشاء وإدارة حملات البريد الإلكتروني الجماعية',
      icon: Mail,
      href: '/admin/broadcasts',
      color: 'bg-blue-500',
      features: ['إنشاء البث', 'جدولة الإرسال', 'تتبع الحالة', 'قوالب جاهزة']
    },
    {
      title: 'إدارة الجماهير',
      description: 'إدارة مجموعات المستخدمين وجهات الاتصال',
      icon: Users,
      href: '/admin/audiences',
      color: 'bg-green-500',
      features: ['إنشاء الجماهير', 'إضافة جهات الاتصال', 'إدارة الاشتراكات', 'البحث والتصفية']
    },
    {
      title: 'إحصائيات البريد الإلكتروني',
      description: 'عرض تقارير وإحصائيات حملات البريد الإلكتروني',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500',
      features: ['معدل الفتح', 'معدل النقر', 'الارتداد', 'إلغاء الاشتراك'],
      comingSoon: true
    },
    {
      title: 'إعدادات النظام',
      description: 'إدارة إعدادات النظام والتكوينات',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500',
      features: ['إعدادات البريد', 'قوالب الرسائل', 'التكوينات', 'النسخ الاحتياطي'],
      comingSoon: true
    }
  ];

  const quickStats = [
    {
      title: 'إجمالي المستخدمين',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'البث المرسل',
      value: '56',
      change: '+8%',
      icon: Send,
      color: 'text-green-600'
    },
    {
      title: 'معدل الفتح',
      value: '68%',
      change: '+5%',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'الجماهير النشطة',
      value: '8',
      change: '+2',
      icon: Database,
      color: 'text-orange-600'
    }
  ];

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h1>
            <p className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة التحكم الإدارية.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
          </div>
          <p className="text-lg text-gray-600">
            مرحباً بك في لوحة التحكم الإدارية. يمكنك من هنا إدارة جميع جوانب نظام البريد الإلكتروني.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> من الشهر الماضي
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">أدوات الإدارة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tool.color} text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{tool.title}</CardTitle>
                          {tool.comingSoon && (
                            <Badge variant="outline" className="mt-1">
                              قريباً
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {tool.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      {tool.comingSoon ? (
                        <Button disabled className="w-full">
                          قريباً
                        </Button>
                      ) : (
                        <Link to={tool.href}>
                          <Button className="w-full">
                            الانتقال إلى {tool.title}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              النشاط الأخير
            </CardTitle>
            <CardDescription>
              آخر الأنشطة في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">تم إرسال بث ترحيب جديد</p>
                  <p className="text-sm text-gray-600">منذ 5 دقائق</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">تم إضافة 12 مستخدم جديد إلى الجمهور الرئيسي</p>
                  <p className="text-sm text-gray-600">منذ 15 دقيقة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">تم إنشاء جمهور جديد: "مستخدمو الألعاب المتقدمة"</p>
                  <p className="text-sm text-gray-600">منذ ساعة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">تم جدولة الملخص الأسبوعي للغد الساعة 9 صباحاً</p>
                  <p className="text-sm text-gray-600">منذ 3 ساعات</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};



export default AdminDashboard;