import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your Document Management System
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Personal Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              Hello, {user?.email.split('@')[0]}!
            </p>
            <p className="mt-2 text-muted-foreground">
              You are logged in as {user?.role}
            </p>
            {user?.departments && user.departments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Your departments:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.departments.map((dept, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};