import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Briefcase, Stethoscope } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const specialties = [
    'MEDECINE',
    'DENTISTE',
    'INFERMIER',
    'SOSIALE',
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const idPattern = /^\d{4}[A-Z]$/;

    if (!ID || !password) {
      toast.error('Please enter both ID and password');
      return;
    }

    if (selectedRole === 'doctor' && !specialty) {
      toast.error('Please select your specialty');
      return;
    }

    if (!idPattern.test(ID)) {
      toast.error('ID must be exactly four digits followed by one uppercase letter');
      return;
    }

    login(selectedRole);
    toast.success(`Logged in as ${selectedRole}${selectedRole === 'doctor' ? ` (${specialty})` : ''}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-medsuite-light to-white p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Sonatrach MedSuite Logo"
            className="mx-auto mb-4 h-32 w-auto"
          />
          <h4 className="text-3xl font-bold text-medsuite-dark mb-3">
            Sonatrach MedSuite
          </h4>
        </div>

        <Card className="border-medsuite-primary/20">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue="doctor"
              className="mb-6"
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="doctor"
                  className="flex items-center gap-1"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span className="hidden sm:inline">Doctor</span>
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doctor">
                <p className="text-sm text-muted-foreground mb-4">
                  Manage patient appointments and records
                </p>
              </TabsContent>
              <TabsContent value="admin">
                <p className="text-sm text-muted-foreground mb-4">
                  Oversee company healthcare operations
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                {selectedRole === 'doctor' && (
                  <div className="grid gap-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="ID">ID</Label>
                  <Input
                    id="ID"
                    placeholder="Enter your ID"
                    value={ID}
                    onChange={(e) => setID(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm text-medsuite-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-medsuite-primary hover:bg-medsuite-accent"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
