import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, Download, Mail, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useMemo, FC } from 'react';
import { Link } from 'react-router-dom';

// --- Mock Data and Types ---

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  email: string;
  phone: string;
}

const doctorsData: Doctor[] = [
  { id: 1, name: 'Dr. Mohammed Ali', specialty: 'General Medicine', avatar: 'MA', email: 'mohammed.ali@sonatrach.dz', phone: '+213 123 456 789' },
  { id: 2, name: 'Dr. Fatima Zahra', specialty: 'Dentist', avatar: 'FZ', email: 'fatima.zahra@sonatrach.dz', phone: '+213 876 543 210' },
  { id: 3, name: 'Dr. Karim Benzema', specialty: 'Psychologist', avatar: 'KB', email: 'karim.benzema@sonatrach.dz', phone: '+213 567 812 345' },
  { id: 4, name: 'Dr. Nadia Saoudi', specialty: 'General Medicine', avatar: 'NS', email: 'nadia.saoudi@sonatrach.dz', phone: '+213 432 187 654' },
];


// --- Reusable Doctor Table Component ---

interface DoctorTableProps {
  doctors: Doctor[];
}

const DoctorTable: FC<DoctorTableProps> = ({ doctors }) => {
  if (doctors.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        No doctors found matching your search.
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Doctor</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {doctor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{doctor.specialty}</TableCell>
              <TableCell className="hidden md:table-cell">{doctor.email}</TableCell>
              <TableCell className="hidden lg:table-cell">{doctor.phone}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Message</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


// --- Main Page Component ---

const DoctorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    if (!lowercasedQuery) {
      return doctorsData;
    }
    return doctorsData.filter(doctor =>
      doctor.name.toLowerCase().includes(lowercasedQuery) ||
      doctor.specialty.toLowerCase().includes(lowercasedQuery) ||
      doctor.email.toLowerCase().includes(lowercasedQuery) ||
      doctor.phone.includes(searchQuery) // phone doesn't need to be lowercased
    );
  }, [searchQuery]);

  return (
    <AppLayout title="Doctors Management">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Manage company medical personnel.</CardDescription>
          </div>
          <Button asChild>
            <Link to="/doctors/add"><Plus className="mr-2 h-4 w-4" />Add Doctor</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, specialty, email, or phone..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>
          </div>
          
          <DoctorTable doctors={filteredDoctors} />

        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default DoctorsPage;