
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Map, Phone, Mail, Users, Calendar, Building2 } from 'lucide-react';
import { Department } from './DepartmentCard';

interface DepartmentDetailedCardProps {
  department: Department;
}

export const DepartmentDetailedCard = ({ department }: DepartmentDetailedCardProps) => {
  return (
    <Card key={department.id}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-xl font-semibold mb-1">{department.name}</h3>
            <p className="text-muted-foreground flex items-center mb-4">
              <Map className="mr-1 h-4 w-4" />
              {department.location}
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Contact Information</h4>
                <div className="text-sm space-y-1 mt-1">
                  <p className="flex items-center text-muted-foreground">
                    <Phone className="mr-2 h-3 w-3" />
                    {department.contact.phone}
                  </p>
                  <p className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-3 w-3" />
                    {department.contact.email}
                  </p>
                  <p className="flex items-center">
                    <Users className="mr-2 h-3 w-3" />
                    Manager: {department.contact.manager}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Specialties</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {department.specialties.map(specialty => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center mb-2">
                <Users className="mr-2 h-5 w-5 text-medsuite-primary" />
                <h4 className="font-medium">Staff</h4>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-2xl font-bold">{department.doctors}</p>
                  <p className="text-sm text-muted-foreground">Doctors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{department.staff}</p>
                  <p className="text-sm text-muted-foreground">Support Staff</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center mb-2">
                <Calendar className="mr-2 h-5 w-5 text-medsuite-primary" />
                <h4 className="font-medium">Appointments</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{department.appointmentsThisWeek}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{department.totalAppointments}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center mb-2">
                <Building2 className="mr-2 h-5 w-5 text-medsuite-primary" />
                <h4 className="font-medium">Facility</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Occupancy</p>
                    <Badge className={`${
                      department.occupancy > 80 ? 'bg-red-500' : 
                      department.occupancy > 60 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    } text-white`}>
                      {department.occupancy}%
                    </Badge>
                  </div>
                  <Progress value={department.occupancy} className="h-2 mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm">View Staff</Button>
          <Button variant="outline" size="sm">View Schedule</Button>
          <Button size="sm">Manage Department</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentDetailedCard;
