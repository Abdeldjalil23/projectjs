
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { CircleEllipsis, Map, Edit, Trash2 } from 'lucide-react';

export interface Department {
  id: number;
  name: string;
  doctors: number;
  staff: number;
  totalAppointments: number;
  appointmentsThisWeek: number;
  location: string;
  occupancy: number;
  contact: {
    phone: string;
    email: string;
    manager: string;
  };
  specialties: string[];
}

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard = ({ department }: DepartmentCardProps) => {
  return (
    <Card key={department.id} className="overflow-hidden">
      <div 
        className={`h-1 w-full ${
          department.occupancy > 80 ? 'bg-red-500' : 
          department.occupancy > 60 ? 'bg-yellow-500' : 
          'bg-green-500'
        }`} 
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{department.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <CircleEllipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="flex items-center">
          <Map className="mr-1 h-3 w-3" />
          {department.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Doctors</span>
            <span className="font-medium">{department.doctors}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Staff</span>
            <span className="font-medium">{department.staff}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Weekly Appointments</span>
            <span className="font-medium">{department.appointmentsThisWeek}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Occupancy</span>
            <span className="font-medium">{department.occupancy}%</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs flex justify-between">
            <span>Occupancy</span>
            <span>{department.occupancy}%</span>
          </div>
          <Progress value={department.occupancy} className="h-1" />
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {department.specialties.map(specialty => (
            <Badge key={specialty} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
