import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserIcon,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  EditIcon,
  MoreHorizontal,
  PillIcon,
  FilterIcon,
  InfoIcon,
} from "lucide-react";

// --- Type Definitions ---
type Employee = {
  id: number;
  name: string;
  role: 'admin' | 'doctor' | 'patient';
  department: string;
  phone: string;
};

type Medicine = {
  id: number;
  name: string;
  genericName?: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  expiryDate: string;
  threshold: number;
  location: string;
  description?: string;
  prescriptionRequired: boolean;
};

// --- Mock Data ---
const employeesData: Employee[] = [
  { id: 1, name: 'Dr. Sara Mahmoud', role: 'doctor', department: 'Cardiology', phone: '+213-555-1234' },
  { id: 2, name: 'Omar Belkacem', role: 'admin', department: 'Administration', phone: '+213-555-5678' },
  { id: 3, name: 'Lina Cherif', role: 'patient', department: 'Outpatient', phone: '+213-555-9012' },
];

const medicinesData: Medicine[] = [
  { 
    id: 1, 
    name: 'Paracetamol 500mg', 
    genericName: 'Acetaminophen',
    category: 'Analgesic', 
    quantity: 150, 
    unit: 'tablets',
    price: 0.15, 
    supplier: 'PharmaCorp', 
    expiryDate: '2024-12-31', 
    threshold: 50,
    location: 'Shelf A1',
    description: 'Pain reliever and fever reducer',
    prescriptionRequired: false
  },
  { 
    id: 2, 
    name: 'Amoxicillin 500mg', 
    genericName: 'Amoxicillin',
    category: 'Antibiotic', 
    quantity: 30, 
    unit: 'capsules',
    price: 0.45, 
    supplier: 'MedSupply Ltd', 
    expiryDate: '2023-11-30', 
    threshold: 20,
    location: 'Shelf B2',
    description: 'Broad-spectrum antibiotic',
    prescriptionRequired: true
  },
  { 
    id: 3, 
    name: 'Ibuprofen 400mg', 
    genericName: 'Ibuprofen',
    category: 'NSAID', 
    quantity: 45, 
    unit: 'tablets',
    price: 0.25, 
    supplier: 'PharmaCorp', 
    expiryDate: '2025-03-15', 
    threshold: 30,
    location: 'Shelf A3',
    description: 'Anti-inflammatory pain reliever',
    prescriptionRequired: false
  },
  { 
    id: 4, 
    name: 'Insulin Regular', 
    genericName: 'Insulin Human',
    category: 'Hormone', 
    quantity: 12, 
    unit: 'vials',
    price: 25.00, 
    supplier: 'BioPharma Inc', 
    expiryDate: '2023-09-30', 
    threshold: 15,
    location: 'Refrigerator R1',
    description: 'Diabetes management',
    prescriptionRequired: true
  },
  { 
    id: 5, 
    name: 'Omeprazole 20mg', 
    genericName: 'Omeprazole',
    category: 'PPI', 
    quantity: 80, 
    unit: 'capsules',
    price: 0.80, 
    supplier: 'MedSupply Ltd', 
    expiryDate: '2025-06-30', 
    threshold: 25,
    location: 'Shelf C1',
    description: 'Gastric acid reducer',
    prescriptionRequired: true
  },
  { 
    id: 6, 
    name: 'Vitamin D3 1000IU', 
    genericName: 'Cholecalciferol',
    category: 'Vitamin', 
    quantity: 200, 
    unit: 'tablets',
    price: 0.12, 
    supplier: 'NutriHealth', 
    expiryDate: '2026-01-15', 
    threshold: 40,
    location: 'Shelf D1',
    description: 'Bone health supplement',
    prescriptionRequired: false
  }
];

// --- Utility Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// --- Dashboard Widgets ---
const StatsWidgets = () => {
  const totalMedicines = medicinesData.length;
  const totalEmployees = employeesData.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {[
        { 
          title: "Total Employees", 
          value: totalEmployees, 
          icon: UserIcon,
          description: "Total employees in system"
        },
        { 
          title: "Total Medicines", 
          value: totalMedicines, 
          icon: PillIcon,
          description: "Total medicines in inventory"
        },
      ].map((stat) => (
        <Card key={stat.title} className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- User Management Section ---
const UserManagementSection = () => {
  const [employees, setEmployees] = useState<Employee[]>(employeesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: 'patient' as 'admin' | 'doctor' | 'patient',
    department: '',
    phone: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.department && newEmployee.phone) {
      setEmployees([
        ...employees,
        {
          id: employees.length + 1,
          ...newEmployee,
        },
      ]);
      setNewEmployee({ name: '', role: 'patient', department: '', phone: '' });
      setIsAdding(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleModifyEmployee = () => {
    if (editingEmployee && newEmployee.name && newEmployee.department && newEmployee.phone) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee.id ? { ...newEmployee, id: emp.id } : emp
        )
      );
      setNewEmployee({ name: '', role: 'patient', department: '', phone: '' });
      setEditingEmployee(null);
      setIsAdding(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleDeleteEmployee = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const handleViewDetails = (employee: Employee) => {
    alert(`Details for ${employee.name}:\nRole: ${employee.role}\nDepartment: ${employee.department}\nPhone: ${employee.phone}`);
  };

  const handleEditEmployee = (employee: Employee) => {
    setNewEmployee({
      name: employee.name,
      role: employee.role,
      department: employee.department,
      phone: employee.phone,
    });
    setEditingEmployee(employee);
    setIsAdding(true);
  };

  const handleRoleChange = (value: 'admin' | 'doctor' | 'patient') => {
    setNewEmployee({ ...newEmployee, role: value });
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">User Management</CardTitle>
            <CardDescription>Manage employee accounts and roles</CardDescription>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusIcon className="h-4 w-4 mr-2" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? 'Modify the employee details below.' : 'Enter the details for the new employee.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="Enter name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Select value={newEmployee.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Department</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    placeholder="Enter department"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="Enter phone"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewEmployee({ name: '', role: 'patient', department: '', phone: '' });
                    setEditingEmployee(null);
                    setIsAdding(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingEmployee ? handleModifyEmployee : handleAddEmployee}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {editingEmployee ? 'Save Changes' : 'Save Employee'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>  
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              aria-label="Search employees"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Role</TableHead>
              <TableHead className="font-semibold text-gray-700">Department</TableHead>
              <TableHead className="font-semibold text-gray-700 w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{employee.name}</TableCell>
                <TableCell>
                  <Badge variant={employee.role === 'admin' ? 'default' : employee.role === 'doctor' ? 'secondary' : 'outline'}>
                    {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" title="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(employee)}
                          className="justify-start"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" /> Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="justify-start"
                        >
                          <EditIcon className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="justify-start text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- Medicine Inventory Section ---
const PharmacyManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<Medicine | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Medicine | null>(null);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
  });

  const filteredMedicines = useMemo(() => {
    return medicinesData.filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const categories = [...new Set(medicinesData.map(m => m.category))];

  const handleAddMedicine = () => {
    if (newMedicine.name && newMedicine.category && newMedicine.quantity && newMedicine.unit) {
      // This is a simplified example; in a real app, you'd update medicinesData or make an API call
      console.log('Adding medicine:', newMedicine);
      setNewMedicine({ name: '', category: '', quantity: 0, unit: '' });
      setShowAddDialog(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleEditMedicine = () => {
    if (editingMedicine && newMedicine.name && newMedicine.category && newMedicine.quantity && newMedicine.unit) {
      // This is a simplified example; in a real app, you'd update medicinesData or make an API call
      console.log('Editing medicine:', newMedicine);
      setNewMedicine({ name: '', category: '', quantity: 0, unit: '' });
      setEditingMedicine(null);
      setShowAddDialog(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleDeleteMedicine = (id: number) => {
    // This is a simplified example; in a real app, you'd update medicinesData or make an API call
    console.log(`Deleting medicine with id: ${id}`);
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Medicine Inventory</CardTitle>
            <CardDescription>Manage medicine stock</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
                <DialogDescription>
                  {editingMedicine ? 'Modify the medicine details below.' : 'Enter the details for the new medicine.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    placeholder="e.g., Paracetamol 500mg"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Select
                    value={newMedicine.category}
                    onValueChange={(value) => setNewMedicine({ ...newMedicine, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newMedicine.quantity}
                    onChange={(e) => setNewMedicine({ ...newMedicine, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit</Label>
                  <Input
                    id="unit"
                    value={newMedicine.unit}
                    onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                    placeholder="e.g., tablets"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewMedicine({ name: '', category: '', quantity: 0, unit: '' });
                    setEditingMedicine(null);
                    setShowAddDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingMedicine ? handleEditMedicine : handleAddMedicine}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {editingMedicine ? 'Save Changes' : 'Save Medicine'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              aria-label="Search medicines"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Simplified Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700 text-sm py-2">Medicine</TableHead>
                <TableHead className="font-semibold text-gray-700 text-sm py-2">Quantity</TableHead>
                <TableHead className="font-semibold text-gray-700 text-sm py-2 w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <TableRow key={medicine.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm py-2">{medicine.name}</TableCell>
                  <TableCell className="text-sm py-2">{medicine.quantity} {medicine.unit}</TableCell>
                  <TableCell className="py-2">
                    <DropdownMenu>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" title="More Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>More Actions</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setShowDetailsDialog(medicine)}
                          >
                            <InfoIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMedicine(medicine);
                              setNewMedicine({
                                name: medicine.name,
                                category: medicine.category,
                                quantity: medicine.quantity,
                                unit: medicine.unit,
                              });
                              setShowAddDialog(true);
                            }}
                          >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(medicine)}
                            className="text-destructive"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </TooltipProvider>
                    </DropdownMenu>

                    {/* Details Dialog */}
                    <Dialog open={showDetailsDialog?.id === medicine.id} onOpenChange={(open) => setShowDetailsDialog(open ? medicine : null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{medicine.name}</DialogTitle>
                          <DialogDescription>Medicine Details</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div><strong>Generic Name:</strong> {medicine.genericName || 'N/A'}</div>
                            <div><strong>Category:</strong> {medicine.category}</div>
                            <div><strong>Quantity:</strong> {medicine.quantity} {medicine.unit}</div>
                            <div><strong>Supplier:</strong> {medicine.supplier}</div>
                            <div><strong>Location:</strong> {medicine.location}</div>
                            <div><strong>Threshold:</strong> {medicine.threshold}</div>
                            <div><strong>Prescription:</strong> {medicine.prescriptionRequired ? 'Required' : 'Not Required'}</div>
                            <div><strong>Description:</strong> {medicine.description || 'N/A'}</div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDetailsDialog(null)}>Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={showDeleteDialog?.id === medicine.id} onOpenChange={(open) => setShowDeleteDialog(open ? medicine : null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {medicine.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <DialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMedicine(medicine.id)}>Delete</AlertDialogAction>
                        </DialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Dashboard Component ---
export const UsersManagementPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000); 
  }, []);

  return (
    <AppLayout title="Admin Dashboard">
      <div className="min-h-screen w-full bg-gray-50">
        <main className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
          <StatsWidgets />
          <div className="grid gap-6 md:grid-cols-2">
            <UserManagementSection />
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <PharmacyManagement />
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default UsersManagementPage;
