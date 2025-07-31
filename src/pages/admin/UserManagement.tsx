import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { Search, Mail, Phone, Calendar, Activity } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export const UserManagement = () => {
  const { users, activities, fetchUsers, fetchActivities } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchActivities();
    };
    loadData();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.primary_interest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.trading_experience?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const getUserActivityCount = (userId: string) => {
    return activities.filter(activity => activity.user_id === userId).length;
  };

  const getLastActivity = (userId: string) => {
    const userActivities = activities
      .filter(activity => activity.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return userActivities[0]?.created_at;
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all registered users
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {user.full_name || 'Anonymous User'}
                    </h3>
                    <Badge variant={user.is_admin ? "destructive" : "secondary"}>
                      {user.is_admin ? 'admin' : 'user'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">Email not available</span>
                    </div>
                    
                    {user.phone_number && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone_number}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>{getUserActivityCount(user.user_id)} activities</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {user.trading_experience && (
                      <div>
                        <span className="font-medium text-foreground">Experience: </span>
                        <span className="text-muted-foreground">{user.trading_experience}</span>
                      </div>
                    )}
                    
                    {user.primary_interest && (
                      <div>
                        <span className="font-medium text-foreground">Interest: </span>
                        <span className="text-muted-foreground">{user.primary_interest}</span>
                      </div>
                    )}
                  </div>

                  {getLastActivity(user.user_id) && (
                    <div className="text-sm text-muted-foreground">
                      Last active: {new Date(getLastActivity(user.user_id)!).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};