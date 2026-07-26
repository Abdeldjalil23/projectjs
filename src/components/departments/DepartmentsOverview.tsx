
import { DepartmentCard } from './DepartmentCard';
import { Department } from './DepartmentCard';

interface DepartmentsOverviewProps {
  departments: Department[];
}

export const DepartmentsOverview = ({ departments }: DepartmentsOverviewProps) => {
  if (departments.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No departments found matching your search criteria
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {departments.map(department => (
        <DepartmentCard key={department.id} department={department} />
      ))}
    </div>
  );
};

export default DepartmentsOverview;
