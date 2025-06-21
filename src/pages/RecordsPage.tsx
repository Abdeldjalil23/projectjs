
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, FilePenLine, FileCheck, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

const RecordsPage = () => {
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for patient records
  const records = [
    {
      id: 1,
      patientName: 'Ahmed Boulmerka',
      patientId: 'SON-12345',
      dateCreated: '12 Mar, 2025',
      lastUpdated: '12 Mar, 2025',
      doctor: 'Dr. Mohammed Ali',
      recordType: 'General Checkup',
      status: 'Complete',
      avatar: 'AB',
    },
    {
      id: 2,
      patientName: 'Samira Hamdani',
      patientId: 'SON-54321',
      dateCreated: '10 Mar, 2025',
      lastUpdated: '11 Mar, 2025',
      doctor: 'Dr. Fatima Zahra',
      recordType: 'Blood Test Results',
      status: 'Pending Review',
      avatar: 'SH',
    },
    {
      id: 3,
      patientName: 'Ibrahim Nacer',
      patientId: 'SON-67890',
      dateCreated: '05 Mar, 2025',
      lastUpdated: '08 Mar, 2025',
      doctor: 'Dr. Karim Benzema',
      recordType: 'X-Ray Report',
      status: 'Complete',
      avatar: 'IN',
    },
  ];
  
  // Filter records based on search query
  const filteredRecords = records.filter(record => 
    record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.recordType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const pageTitle = userRole === 'patient' ? 'My Medical Records' : 'Patient Records';
  
  return (
    <AppLayout title={pageTitle}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>View and manage medical records</CardDescription>
          </div>
          {userRole !== 'patient' && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Record
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search records..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {userRole !== 'patient' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Sort</Button>
                <Button variant="outline">Export</Button>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              {userRole !== 'patient' && (
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="all" className="space-y-4 mt-4">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <div key={record.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0">
                    <div className="flex items-center gap-3">
                      {userRole !== 'patient' && (
                        <Avatar>
                          <AvatarFallback className="bg-medsuite-secondary text-medsuite-dark">{record.avatar}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <h4 className="font-medium">
                          {userRole === 'patient' ? record.recordType : record.patientName}
                        </h4>
                        <div className="text-sm text-muted-foreground flex flex-col md:flex-row md:gap-3">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Created: {record.dateCreated}
                          </span>
                          <span className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {userRole === 'patient' ? record.doctor : `ID: ${record.patientId}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Badge className={`
                        ${record.status === 'Complete' ? 'bg-green-500' : 
                          record.status === 'Pending Review' ? 'bg-yellow-500' : 
                          'bg-blue-500'} text-white
                      `}>
                        {record.status}
                      </Badge>
                      <div className="flex gap-2 ml-auto md:ml-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        {userRole !== 'patient' && (
                          <Button variant="ghost" size="icon">
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No records found matching your search criteria
                </div>
              )}
            </TabsContent>
            <TabsContent value="recent" className="space-y-4 mt-4">
              {filteredRecords.slice(0, 2).length > 0 ? (
                filteredRecords.slice(0, 2).map(record => (
                  <div key={record.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0">
                    <div className="flex items-center gap-3">
                      {userRole !== 'patient' && (
                        <Avatar>
                          <AvatarFallback className="bg-medsuite-secondary text-medsuite-dark">{record.avatar}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <h4 className="font-medium">
                          {userRole === 'patient' ? record.recordType : record.patientName}
                        </h4>
                        <div className="text-sm text-muted-foreground flex flex-col md:flex-row md:gap-3">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Updated: {record.lastUpdated}
                          </span>
                          <span className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {userRole === 'patient' ? record.doctor : `ID: ${record.patientId}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Badge className={`
                        ${record.status === 'Complete' ? 'bg-green-500' : 
                          record.status === 'Pending Review' ? 'bg-yellow-500' : 
                          'bg-blue-500'} text-white
                      `}>
                        {record.status}
                      </Badge>
                      <div className="flex gap-2 ml-auto md:ml-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        {userRole !== 'patient' && (
                          <Button variant="ghost" size="icon">
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No recent records found
                </div>
              )}
            </TabsContent>
            {userRole !== 'patient' && (
              <TabsContent value="pending" className="space-y-4 mt-4">
                {filteredRecords.filter(r => r.status === 'Pending Review').length > 0 ? (
                  filteredRecords.filter(r => r.status === 'Pending Review').map(record => (
                    <div key={record.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-medsuite-secondary text-medsuite-dark">{record.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{record.patientName}</h4>
                          <div className="text-sm text-muted-foreground flex flex-col md:flex-row md:gap-3">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Created: {record.dateCreated}
                            </span>
                            <span className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              ID: {record.patientId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Badge className="bg-yellow-500 text-white">
                          {record.status}
                        </Badge>
                        <div className="flex gap-2 ml-auto md:ml-2">
                          <Button variant="ghost" size="icon">
                            <FileCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    No records pending review
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default RecordsPage;
