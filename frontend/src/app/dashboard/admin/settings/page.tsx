'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const settings = [
    { label: 'Application', items: [
      { key: 'App Name', value: 'Wholesale Clothing Management Platform' },
      { key: 'Version', value: '1.0.0' },
      { key: 'Environment', value: 'Production' },
      { key: 'API Base URL', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api' },
    ]},
    { label: 'Security', items: [
      { key: 'Password Hashing', value: 'BCrypt (Strength 12)' },
      { key: 'JWT Access Token Expiry', value: '15 minutes' },
      { key: 'JWT Refresh Token Expiry', value: '7 days' },
      { key: 'OTP Expiry', value: '10 minutes' },
      { key: 'OTP Length', value: '6 digits' },
      { key: 'Session Policy', value: 'Stateless (JWT)' },
    ]},
    { label: 'Infrastructure', items: [
      { key: 'Database', value: 'PostgreSQL 16' },
      { key: 'Backend', value: 'Spring Boot 3 (Java 21)' },
      { key: 'Frontend', value: 'Next.js 14 (TypeScript)' },
      { key: 'Container Runtime', value: 'Docker' },
      { key: 'Cloud Provider', value: 'AWS (VPC, ALB, ASG, RDS, S3, CloudFront)' },
      { key: 'CI/CD', value: 'GitHub Actions' },
      { key: 'IaC', value: 'Terraform' },
    ]},
    { label: 'RBAC Configuration', items: [
      { key: 'Roles', value: 'ADMIN, MANAGER, SELLER, USER' },
      { key: 'Total Permissions', value: '34' },
      { key: 'Default Accounts', value: '3 (Admin, Manager, Seller)' },
      { key: 'Force Password Change', value: 'Enabled for default accounts' },
    ]},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">System Settings</h2><p className="text-muted-foreground">Platform configuration overview</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settings.map((section) => (
          <Card key={section.label}>
            <CardHeader><CardTitle className="text-lg">{section.label}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {section.items.map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <span className="text-sm text-muted-foreground">{item.key}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
