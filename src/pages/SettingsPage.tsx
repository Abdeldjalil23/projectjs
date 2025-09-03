
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, KeyRound, Bell, Shield, Moon, Sun } from 'lucide-react';

const SettingsPage = () => {
  const { userRole } = useAuth();

  return (
    <AppLayout title="Settings">
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-flex">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details and profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-medsuite-primary text-white text-xl">
                      {userRole === 'doctor' ? 'DR' : userRole === 'admin' ? 'AD' : 'PT'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" defaultValue={userRole === 'doctor' ? 'Dr. Mohammed Ali' : userRole === 'admin' ? 'Amina Benali' : 'Ahmed Boulmerka'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Your email" defaultValue="user@sonatrach.dz" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Your phone" defaultValue="+213 12345678" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee-id">
                        {userRole === 'doctor' ? 'Medical License Number' : 'Employee ID'}
                      </Label>
                      <Input id="employee-id" placeholder={userRole === 'doctor' ? "Medical license" : "Employee ID"} defaultValue={userRole === 'doctor' ? 'MED-12345' : 'SON-54321'} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Professional Information</Label>
                    <Input id="bio" placeholder="About you" defaultValue={
                      userRole === 'doctor' ? 'Cardiologist with 10+ years of experience.' : 
                      userRole === 'admin' ? 'Medical services administrator' : 
                      'Sonatrach engineering department'
                    } />
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Authentication</h4>
                    <p className="text-sm text-muted-foreground">Receive verification codes via SMS</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">Use an authenticator app for 2FA</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-base font-medium mb-3">Notification Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Appointment Reminders</h4>
                        <p className="text-sm text-muted-foreground">Get notified about upcoming appointments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Prescription Updates</h4>
                        <p className="text-sm text-muted-foreground">Get notified about prescription changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">New Messages</h4>
                        <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Updates</h4>
                        <p className="text-sm text-muted-foreground">Get notified about platform updates</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Manage your display preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <div className="flex gap-4 mt-1">
                    <div className="flex flex-1 items-center gap-2 border rounded-md p-3 cursor-pointer bg-background">
                      <Sun className="h-5 w-5" />
                      <div className="font-medium">Light</div>
                    </div>
                    <div className="flex flex-1 items-center gap-2 border rounded-md p-3 cursor-pointer">
                      <Moon className="h-5 w-5" />
                      <div className="font-medium">Dark</div>
                    </div>
                    <div className="flex flex-1 items-center gap-2 border rounded-md p-3 cursor-pointer">
                      <div className="flex">
                        <Sun className="h-5 w-5" />
                        <Moon className="h-5 w-5 ml-1" />
                      </div>
                      <div className="font-medium">System</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="font-medium">Reduce Animations</h4>
                    <p className="text-sm text-muted-foreground">Simplify visual effects for accessibility</p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SettingsPage;
