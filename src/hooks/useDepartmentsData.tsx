
import { useState } from 'react';
import { Department } from '@/components/departments/DepartmentCard';

export const useDepartmentsData = () => {
  // Mock data for departments
  const departments: Department[] = [
    {
      id: 1,
      name: 'Medical Center 1',
      doctors: 12,
      staff: 28,
      totalAppointments: 320,
      appointmentsThisWeek: 78,
      location: 'Headquarters, Algiers',
      occupancy: 75,
      contact: {
        phone: '+213 1234 5678',
        email: 'medcenter1@sonatrach.dz',
        manager: 'Dr. Omar Benali'
      },
      specialties: ['Cardiology', 'Internal Medicine', 'Orthopedics']
    },
    {
      id: 2,
      name: 'Medical Center 2',
      doctors: 8,
      staff: 22,
      totalAppointments: 245,
      appointmentsThisWeek: 65,
      location: 'East Campus, Oran',
      occupancy: 60,
      contact: {
        phone: '+213 2345 6789',
        email: 'medcenter2@sonatrach.dz',
        manager: 'Dr. Fatima Zahra'
      },
      specialties: ['Pediatrics', 'Dermatology', 'General Medicine']
    },
    {
      id: 3,
      name: 'Medical Center 3',
      doctors: 6,
      staff: 15,
      totalAppointments: 180,
      appointmentsThisWeek: 45,
      location: 'South Facility, Hassi Messaoud',
      occupancy: 90,
      contact: {
        phone: '+213 3456 7890',
        email: 'medcenter3@sonatrach.dz',
        manager: 'Dr. Karim Ahmed'
      },
      specialties: ['Emergency Medicine', 'Occupational Health']
    },
    {
      id: 4,
      name: 'Specialist Clinic',
      doctors: 5,
      staff: 10,
      totalAppointments: 120,
      appointmentsThisWeek: 35,
      location: 'North Campus, Algiers',
      occupancy: 65,
      contact: {
        phone: '+213 4567 8901',
        email: 'specialist@sonatrach.dz',
        manager: 'Dr. Nadia Saoudi'
      },
      specialties: ['Ophthalmology', 'ENT', 'Neurology']
    }
  ];
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter departments based on search query
  const filteredDepartments = departments.filter(department => 
    department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    department.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    department.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return {
    departments,
    searchQuery,
    setSearchQuery,
    filteredDepartments
  };
};

export default useDepartmentsData;
