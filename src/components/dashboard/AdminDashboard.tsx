import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Phone } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import {
  Users,
  User,
  Building2,
  AlertTriangle,
  TrendingUp,
  FileBarChart,
  UserCog,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  BarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const chronicIllnessData = [
    { name: 'Diabète', count: 124 },
    { name: 'Hypertension Artérielle', count: 210 },
    { name: 'Asthme', count: 78 },
    { name: 'Maladies Cardiaques', count: 56 },
    { name: 'Arthrite', count: 95 },
    { name: 'Maladie Rénale', count: 42 },
  ];

  const healthTrends = [
    { month: "Jan", Respiratory: 20, Cardiovascular: 24, Orthopedic: 15, Other: 12 },
    { month: "Feb", Respiratory: 15, Cardiovascular: 28, Orthopedic: 18, Other: 11 },
    { month: "Mar", Respiratory: 25, Cardiovascular: 26, Orthopedic: 16, Other: 14 },
    { month: "Apr", Respiratory: 30, Cardiovascular: 24, Orthopedic: 20, Other: 16 },
    { month: "May", Respiratory: 18, Cardiovascular: 22, Orthopedic: 22, Other: 15 },
    { month: "Jun", Respiratory: 14, Cardiovascular: 20, Orthopedic: 17, Other: 13 },
  ];

  const doctorsData = [
    { id: 1, name: 'Dr. Mohammed Ali', specialty: 'General Medicine', avatar: 'MA', email: 'mohammed.ali@sonatrach.dz', phone: '+213 123 456 789' },
    { id: 2, name: 'Dr. Fatima Zahra', specialty: 'Dentist', avatar: 'FZ', email: 'fatima.zahra@sonatrach.dz', phone: '+213 876 543 210' },
    { id: 3, name: 'Dr. Karim Benzema', specialty: 'Psychologist', avatar: 'KB', email: 'karim.benzema@sonatrach.dz', phone: '+213 567 812 345' },
    { id: 4, name: 'Dr. Nadia Saoudi', specialty: 'General Medicine', avatar: 'NS', email: 'nadia.saoudi@sonatrach.dz', phone: '+213 432 187 654' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h3 className="text-2xl font-bold">845</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <Users className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Number Of Doctors</p>
              <h3 className="text-2xl font-bold">4</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <User className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Medical Centers</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <Building2 className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chronique</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-red-500">Requires immediate action</p>
        </Card>

        <Card
          className="stats-card cursor-pointer hover:bg-muted/50 transition"
          onClick={() => navigate("/admin/users")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Users</p>
              <h3 className="text-2xl font-bold">21</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <UserCog className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Manage Users</p>
        </Card>
      </div>
{/* // the charts */}
      {/* <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Health Trends
              </CardTitle>
              <CardDescription>
                Monthly breakdown of medical cases by category
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <FileBarChart className="h-4 w-4" /> Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList className="mb-4">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="line">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={healthTrends}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Respiratory"
                      stackId="1"
                      stroke="#3EAAB8"
                      fill="#E6F7F9"
                    />
                    <Area
                      type="monotone"
                      dataKey="Cardiovascular"
                      stackId="1"
                      stroke="#2A7B85"
                      fill="#B3E1E9"
                    />
                    <Area
                      type="monotone"
                      dataKey="Orthopedic"
                      stackId="1"
                      stroke="#1D4E54"
                      fill="#D3EDF1"
                    />
                    <Area
                      type="monotone"
                      dataKey="Other"
                      stackId="1"
                      stroke="#718096"
                      fill="#EDF2F7"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="bar">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={healthTrends}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Respiratory" fill="#3EAAB8" />
                    <Bar dataKey="Cardiovascular" fill="#2A7B85" />
                    <Bar dataKey="Orthopedic" fill="#1D4E54" />
                    <Bar dataKey="Other" fill="#718096" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card> */}

the add 
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate("/admin/users")} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
