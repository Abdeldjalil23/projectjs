
import { DepartmentDetailedCard } from './DepartmentDetailedCard';
import { Department } from './DepartmentCard';

interface DepartmentsDetailedViewProps {
  departments: Department[];
}

export const DepartmentsDetailedView = ({ departments }: DepartmentsDetailedViewProps) => {
  if (departments.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No departments found matching your search criteria
      </div>
    );
  }
  
  return (
    <div className="space-y-5">
      {departments.map(department => (
        <DepartmentDetailedCard key={department.id} department={department} />
      ))}
    </div>
  );
};

export default DepartmentsDetailedView;
