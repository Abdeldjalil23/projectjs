
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import DepartmentsOverview from '@/components/departments/DepartmentsOverview';
import DepartmentsDetailedView from '@/components/departments/DepartmentsDetailedView';
import MapPlaceholder from '@/components/departments/MapPlaceholder';
import ResourcesSummary from '@/components/departments/ResourcesSummary';
import { useDepartmentsData } from '@/hooks/useDepartmentsData';

const DepartmentsPage = () => {
  const { searchQuery, setSearchQuery, filteredDepartments } = useDepartmentsData();

  return (
    <AppLayout title="Departments Management">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Medical Departments</CardTitle>
              <CardDescription>Manage medical facilities and departments</CardDescription>
            </div>
            <Button asChild>
              <Link to="/departments/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search departments by name, location, or specialty..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-6">
                <DepartmentsOverview departments={filteredDepartments} />
              </TabsContent>
              
              <TabsContent value="detailed" className="mt-6">
                <DepartmentsDetailedView departments={filteredDepartments} />
              </TabsContent>
              
              <TabsContent value="map" className="mt-6">
                <MapPlaceholder />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <ResourcesSummary />
      </div>
    </AppLayout>
  );
};

export default DepartmentsPage;
