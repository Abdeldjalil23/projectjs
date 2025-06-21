
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileBarChart, Download, Filter, Users, Calendar, Building, Activity } from 'lucide-react';

const StatsPage = () => {
  // Mock data for departmental performance
  const departmentPerformance = [
    { name: 'Production', efficiency: 85, safety: 90, attendance: 78 },
    { name: 'Engineering', efficiency: 82, safety: 95, attendance: 85 },
    { name: 'Maintenance', efficiency: 78, safety: 88, attendance: 82 },
    { name: 'Administration', efficiency: 90, safety: 92, attendance: 95 },
    { name: 'Logistics', efficiency: 75, safety: 85, attendance: 80 },
  ];

  // Mock data for employee health trends
  const healthTrends = [
    { month: 'Jan', sick: 42, wellness: 85, treatment: 35 },
    { month: 'Feb', sick: 38, wellness: 87, treatment: 30 },
    { month: 'Mar', sick: 45, wellness: 84, treatment: 38 },
    { month: 'Apr', sick: 40, wellness: 86, treatment: 32 },
    { month: 'May', sick: 35, wellness: 88, treatment: 28 },
    { month: 'Jun', sick: 32, wellness: 90, treatment: 25 },
  ];

  // Mock data for medical service usage
  const serviceUsage = [
    { name: 'Consultations', value: 42 },
    { name: 'Checkups', value: 28 },
    { name: 'Treatments', value: 18 },
    { name: 'Emergency', value: 12 },
  ];

  const COLORS = ['#EF8A23', '#0088FE', '#00C49F', '#FF8042'];

  return (
    <AppLayout title="Employee Stats">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee Health & Performance Analytics</h1>
            <p className="text-muted-foreground">Comprehensive statistics and insights across departments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3,845</div>
              <p className="text-sm text-muted-foreground mt-1">Across 12 departments</p>
              <div className="mt-2 text-xs font-medium text-green-500">↑ 2.5% from last month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Health Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,249</div>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
              <div className="mt-2 text-xs font-medium text-green-500">↑ 4.2% from last month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Wellness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87.2%</div>
              <p className="text-sm text-muted-foreground mt-1">Company average</p>
              <div className="mt-2 text-xs font-medium text-green-500">↑ 1.8% from last month</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Departmental Performance</CardTitle>
            <CardDescription>Efficiency, safety compliance, and attendance metrics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bar">
              <TabsList>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="line">Line Chart</TabsTrigger>
              </TabsList>
              <TabsContent value="bar">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="efficiency" name="Efficiency %" fill="#EF8A23" />
                      <Bar dataKey="safety" name="Safety Compliance %" fill="#00C49F" />
                      <Bar dataKey="attendance" name="Attendance Rate %" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="line">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={departmentPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#EF8A23" />
                      <Line type="monotone" dataKey="safety" name="Safety Compliance %" stroke="#00C49F" />
                      <Line type="monotone" dataKey="attendance" name="Attendance Rate %" stroke="#0088FE" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Health Trends</CardTitle>
              <CardDescription>6-month trend of sick days, wellness checks, and treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={healthTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sick" name="Sick Days" stroke="#FF8042" />
                    <Line type="monotone" dataKey="wellness" name="Wellness Score" stroke="#00C49F" />
                    <Line type="monotone" dataKey="treatment" name="Treatments" stroke="#0088FE" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Service Usage</CardTitle>
              <CardDescription>Distribution of medical services utilized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {serviceUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default StatsPage;
