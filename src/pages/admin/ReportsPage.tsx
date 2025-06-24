
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Filter, BarChart3, PieChart, FileDown, Users, Clock } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  
  // Mock data for appointment trends
  const appointmentData = [
    { name: 'Week 1', appointments: 125, completed: 115, cancelled: 10 },
    { name: 'Week 2', appointments: 139, completed: 120, cancelled: 19 },
    { name: 'Week 3', appointments: 132, completed: 125, cancelled: 7 },
    { name: 'Week 4', appointments: 158, completed: 145, cancelled: 13 },
  ];
  
  // Mock data for department stats
  const departmentData = [
    { name: 'Cardiology', patients: 82, color: '#0ea5e9' },
    { name: 'Orthopedics', patients: 65, color: '#22c55e' },
    { name: 'Internal Medicine', patients: 95, color: '#f59e0b' },
    { name: 'Pediatrics', patients: 47, color: '#8b5cf6' },
    { name: 'Dermatology', patients: 38, color: '#ec4899' },
  ];
  
  // Mock data for doctor performance
  const doctorPerformanceData = [
    { name: 'Dr. Mohammed Ali', appointments: 78, rating: 4.8 },
    { name: 'Dr. Fatima Zahra', appointments: 65, rating: 4.5 },
    { name: 'Dr. Karim Benzema', appointments: 58, rating: 4.9 },
    { name: 'Dr. Nadia Saoudi', appointments: 72, rating: 4.7 },
    { name: 'Dr. Omar Hassan', appointments: 55, rating: 4.6 },
  ];
  
  // Mock data for recent reports
  const recentReports = [
    { 
      id: 1,
      name: 'Monthly Health Overview',
      type: 'Health Stats',
      date: '10 Apr, 2025',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Department Performance Q1',
      type: 'Performance',
      date: '05 Apr, 2025',
      size: '3.1 MB'
    },
    {
      id: 3,
      name: 'Employee Health Trends',
      type: 'Health Stats',
      date: '27 Mar, 2025',
      size: '1.8 MB'
    },
    {
      id: 4,
      name: 'Vaccination Coverage Report',
      type: 'Health Campaign',
      date: '20 Mar, 2025',
      size: '4.2 MB'
    }
  ];

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Reports Dashboard</h2>
            <p className="text-muted-foreground">Company-wide health statistics and insights</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Monthly overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">554</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              <div className="mt-4 h-[75px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentData}>
                    <Bar dataKey="appointments" fill="#ef8a23" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Completion Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Appointments attended</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">+1.5% from last month</p>
              <div className="mt-4 h-[75px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentData}>
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Average Wait Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>In minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">16.5</div>
              <p className="text-xs text-green-500">-3.2 from last month</p>
              <div className="mt-4 h-[75px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { day: 'Mon', time: 18 },
                    { day: 'Tue', time: 16 },
                    { day: 'Wed', time: 17 },
                    { day: 'Thu', time: 15 },
                    { day: 'Fri', time: 16 }
                  ]}>
                    <Line 
                      type="monotone" 
                      dataKey="time" 
                      stroke="#0ea5e9" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="appointment-trends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointment-trends">Appointment Trends</TabsTrigger>
            <TabsTrigger value="department-stats">Department Stats</TabsTrigger>
            <TabsTrigger value="doctor-performance">Doctor Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="appointment-trends" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Monthly Appointment Overview
                </CardTitle>
                <CardDescription>
                  Appointment trends over the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="appointments" name="Total Appointments" fill="#ef8a23" />
                      <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                      <Bar dataKey="cancelled" name="Cancelled" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Chart
                  </Button>
                  <Button variant="outline">View Detailed Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="department-stats" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Department Statistics
                </CardTitle>
                <CardDescription>
                  Distribution of patients across medical departments
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="patients"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 mt-6 md:mt-0 md:ml-6">
                  <h4 className="font-medium mb-3">Department Breakdown</h4>
                  <div className="space-y-3">
                    {departmentData.map((dept) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dept.color }}></div>
                          <span>{dept.name}</span>
                        </div>
                        <span className="font-medium">{dept.patients} patients</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="doctor-performance" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Doctor Performance Metrics
                </CardTitle>
                <CardDescription>
                  Comparing appointment volume and patient ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={doctorPerformanceData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="appointments" name="Appointments" fill="#ef8a23" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="rating" name="Rating (out of 5)" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Chart
                  </Button>
                  <Button variant="outline">View Full Analysis</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileDown className="mr-2 h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Recently generated reports available for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 bg-muted/50 text-sm font-medium">
                <div className="col-span-5">Report Name</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y">
                {recentReports.map(report => (
                  <div key={report.id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-5 font-medium">{report.name}</div>
                    <div className="col-span-3">
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <div className="col-span-2 text-muted-foreground text-sm">{report.date}</div>
                    <div className="col-span-2 text-right">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        {report.size}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline">View All Reports</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
