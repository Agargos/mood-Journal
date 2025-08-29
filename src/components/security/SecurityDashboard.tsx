import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityMonitoring } from '@/hooks/useSecurity';

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const { securityAlerts } = useSecurityMonitoring();

  if (!user) return null;

  const securityFeatures = [
    {
      name: 'Row Level Security (RLS)',
      status: 'active',
      description: 'Database-level protection ensuring users can only access their own data'
    },
    {
      name: 'Data Validation',
      status: 'active',
      description: 'Input validation and sanitization for all user submissions'
    },
    {
      name: 'Audit Logging',
      status: 'active',
      description: 'All data changes are logged for security monitoring'
    },
    {
      name: 'Rate Limiting',
      status: 'active',
      description: 'Protection against abuse with request rate limiting'
    },
    {
      name: 'Authentication',
      status: 'active',
      description: 'Secure user authentication with Supabase Auth'
    },
    {
      name: 'Data Encryption',
      status: 'active',
      description: 'Data encrypted in transit and at rest'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Status
        </CardTitle>
        <CardDescription>
          Your data protection and privacy measures
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityFeatures.map((feature) => (
            <div key={feature.name} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(feature.status)}
                  <span className="font-medium text-sm">{feature.name}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(feature.status)}>
                  {feature.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Security Alerts */}
        {securityAlerts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Alerts:</strong> {securityAlerts.length} recent security events detected.
            </AlertDescription>
          </Alert>
        )}

        {/* Privacy Information */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Privacy Protection
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your journal entries are private and only visible to you</li>
            <li>• All data is encrypted both in transit and at rest</li>
            <li>• We use industry-standard security practices</li>
            <li>• No data is shared with third parties without consent</li>
            <li>• You can export or delete your data at any time</li>
          </ul>
        </div>

        {/* Data Access Information */}
        <div className="border-l-4 border-primary pl-4">
          <h4 className="font-medium mb-1">Data Access Rights</h4>
          <p className="text-sm text-muted-foreground">
            You have full control over your data. You can view, edit, export, or delete 
            your information at any time. All data processing is done with your explicit consent.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};