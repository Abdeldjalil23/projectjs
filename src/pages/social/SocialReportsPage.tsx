import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Calendar, 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp,
  TrendingDown,
  Eye,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for reports
const reports = [
  {
    id: 1,
    title: 'Monthly Patient Support Summary',
    type: 'Patient Support',
    period: 'January 2024',
    status: 'Generated',
    generatedDate: '2024-01-31',
    fileSize: '2.3 MB',
    format: 'PDF',
    description: 'Comprehensive report of all patient support cases and outcomes for January 2024.'
  },
  {
    id: 2,
    title: 'Social Services Participation Report',
    type: 'Services',
    period: 'Q4 2023',
    status: 'Generated',
    generatedDate: '2024-01-15',
    fileSize: '1.8 MB',
    format: 'PDF',
    description: 'Quarterly report on social services participation and effectiveness metrics.'
  },
  {
    id: 3,
    title: 'Mental Health Awareness Impact',
    type: 'Wellness',
    period: 'December 2023',
    status: 'Pending',
    generatedDate: null,
    fileSize: null,
    format: 'PDF',
    description: 'Impact assessment report for mental health awareness campaigns and workshops.'
  },
  {
    id: 4,
    title: 'Employee Wellness Program Evaluation',
    type: 'Wellness',
    period: '2023 Annual',
    status: 'Generated',
    generatedDate: '2024-01-10',
    fileSize: '4.1 MB',
    format: 'PDF',
    description: 'Annual evaluation report of the employee wellness program effectiveness and outcomes.'
  },
  {
    id: 5,
    title: 'Family Counseling Sessions Report',
    type: 'Counseling',
    period: 'January 2024',
    status: 'Generated',
    generatedDate: '2024-01-28',
    fileSize: '1.2 MB',
    format: 'PDF',
    description: 'Monthly report on family counseling sessions and participant feedback.'
  }
];

// Mock data for analytics
const analyticsData = {
  totalCases: 156,
  activeCases: 89,
  resolvedCases: 67,
  avgResolutionTime: '12.5 days',
  satisfactionRate: 94.2,
  participationRate: 78.5
};

const SocialReportsPage = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Generated': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Patient Support': return <Users className="h-4 w-4" />;
      case 'Services': return <BarChart3 className="h-4 w-4" />;
      case 'Wellness': return <TrendingUp className="h-4 w-4" />;
      case 'Counseling': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <AppLayout title="Social Reports">
      <div className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Cases",
              value: analyticsData.totalCases,
              icon: <Users className="h-5 w-5 text-medsuite-primary" />,
              trend: "+12%",
              trendUp: true
            },
            {
              title: "Active Cases",
              value: analyticsData.activeCases,
              icon: <TrendingUp className="h-5 w-5 text-medsuite-primary" />,
              trend: "+8%",
              trendUp: true
            },
            {
              title: "Satisfaction Rate",
              value: `${analyticsData.satisfactionRate}%`,
              icon: <BarChart3 className="h-5 w-5 text-medsuite-primary" />,
              trend: "+2.1%",
              trendUp: true
            },
            {
              title: "Avg Resolution Time",
              value: analyticsData.avgResolutionTime,
              icon: <Calendar className="h-5 w-5 text-medsuite-primary" />,
              trend: "-1.2 days",
              trendUp: false
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="stats-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex justify-between items-center p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  <div className={`flex items-center gap-1 text-sm mt-1 ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                </div>
                <div className="p-3 bg-medsuite-secondary rounded-full shadow-sm">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reports Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <CardTitle className="text-xl">Reports & Analytics</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Generate and manage social services reports
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Patient Support">Patient Support</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Wellness">Wellness</SelectItem>
                  <SelectItem value="Counseling">Counseling</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Generated">Generated</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports Table */}
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Report</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Generated</TableHead>
                    <TableHead className="font-semibold">Size</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="text-sm">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{report.period}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-2 py-1 text-white ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.generatedDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {report.generatedDate}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.fileSize ? (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {report.fileSize}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {report.status === 'Generated' ? (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              Generate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SocialReportsPage; 