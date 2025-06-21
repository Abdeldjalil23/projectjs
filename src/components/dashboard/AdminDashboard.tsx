
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, BarChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import { Users, User, Building2, AlertTriangle, TrendingUp, FileBarChart } from 'lucide-react';

export const AdminDashboard = () => {
  const departmentStats = [
    { name: 'Cardiology', employees: 245, appointments: 120, cases: 85 },
    { name: 'Neurology', employees: 185, appointments: 95, cases: 62 },
    { name: 'Orthopedics', employees: 210, appointments: 105, cases: 70 },
    { name: 'Ophthalmology', employees: 160, appointments: 85, cases: 45 },
    { name: 'General Medicine', employees: 320, appointments: 150, cases: 110 },
  ];

  const healthTrends = [
    { month: 'Jan', 'Respiratory': 20, 'Cardiovascular': 24, 'Orthopedic': 15, 'Other': 12 },
    { month: 'Feb', 'Respiratory': 15, 'Cardiovascular': 28, 'Orthopedic': 18, 'Other': 11 },
    { month: 'Mar', 'Respiratory': 25, 'Cardiovascular': 26, 'Orthopedic': 16, 'Other': 14 },
    { month: 'Apr', 'Respiratory': 30, 'Cardiovascular': 24, 'Orthopedic': 20, 'Other': 16 },
    { month: 'May', 'Respiratory': 18, 'Cardiovascular': 22, 'Orthopedic': 22, 'Other': 15 },
    { month: 'Jun', 'Respiratory': 14, 'Cardiovascular': 20, 'Orthopedic': 17, 'Other': 13 },
  ];
  
  const employeeMetrics = [
    { name: 'Production', total: 1520, appointments: 350, leaves: 42 },
    { name: 'Engineering', total: 985, appointments: 210, leaves: 28 },
    { name: 'Administration', total: 680, appointments: 180, leaves: 22 },
    { name: 'Research', total: 420, appointments: 120, leaves: 15 },
    { name: 'Logistics', total: 325, appointments: 95, leaves: 18 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h3 className="text-2xl font-bold">3,845</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <Users className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
          <p className="text-xs text-medsuite-primary">+12 new this month</p>
        </Card>
        
        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Medical Cases</p>
              <h3 className="text-2xl font-bold">257</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <User className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
          <p className="text-xs text-medsuite-primary">18 require attention</p>
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
          <p className="text-xs text-medsuite-primary">2 new centers planned</p>
        </Card>
        
        <Card className="stats-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-red-500">Requires immediate action</p>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Health Trends
              </CardTitle>
              <CardDescription>Monthly breakdown of medical cases by category</CardDescription>
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
                    <Area type="monotone" dataKey="Respiratory" stackId="1" stroke="#3EAAB8" fill="#E6F7F9" />
                    <Area type="monotone" dataKey="Cardiovascular" stackId="1" stroke="#2A7B85" fill="#B3E1E9" />
                    <Area type="monotone" dataKey="Orthopedic" stackId="1" stroke="#1D4E54" fill="#D3EDF1" />
                    <Area type="monotone" dataKey="Other" stackId="1" stroke="#718096" fill="#EDF2F7" />
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
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Stats</CardTitle>
            <CardDescription>Medical metrics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-muted-foreground pb-3">Department</th>
                    <th className="text-center font-medium text-muted-foreground pb-3">Employees</th>
                    <th className="text-center font-medium text-muted-foreground pb-3">Appointments</th>
                    <th className="text-center font-medium text-muted-foreground pb-3">Active Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((dept) => (
                    <tr key={dept.name} className="border-b">
                      <td className="py-3">{dept.name}</td>
                      <td className="py-3 text-center">{dept.employees}</td>
                      <td className="py-3 text-center">{dept.appointments}</td>
                      <td className="py-3 text-center">{dept.cases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Employee Health Metrics</CardTitle>
            <CardDescription>Medical usage by business unit</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {employeeMetrics.map((unit) => (
                  <div key={unit.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{unit.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {unit.total} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{unit.appointments} appointments</Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-500">
                          {unit.leaves} on leave
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Appointment ratio</span>
                        <span className="text-medsuite-primary">
                          {Math.round((unit.appointments / unit.total) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-medsuite-secondary rounded-full overflow-hidden">
                        <div 
                          className="bg-medsuite-primary h-full rounded-full" 
                          style={{ width: `${Math.round((unit.appointments / unit.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
