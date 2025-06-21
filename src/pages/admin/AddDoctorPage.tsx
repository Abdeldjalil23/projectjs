
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import { UserPlus, ArrowLeft } from 'lucide-react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with zod
const doctorFormSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  specialty: z.string().min(2, {
    message: "Specialty must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(8, {
    message: "Phone number must be at least 8 characters.",
  }),
  department: z.string().min(1, {
    message: "Please select a department.",
  }),
  address: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

const AddDoctorPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define the departments (should ideally come from an API)
  const departments = [
    "Medical Center 1",
    "Medical Center 2",
    "Medical Center 3",
  ];
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      fullName: "",
      specialty: "",
      email: "",
      phone: "",
      department: "",
      address: "",
      bio: "",
      isActive: true,
    },
  });

  // Handle form submission
  const onSubmit = async (data: DoctorFormValues) => {
    try {
      setIsSubmitting(true);
      
      // This is where you would normally make an API call to add the doctor
      console.log("Doctor data to submit:", data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Doctor added successfully");
      navigate("/doctors");
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Failed to add doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Add New Doctor">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/doctors")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Button>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Add New Doctor</CardTitle>
              <CardDescription>Enter the doctor's information below</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Mohammed Ali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="Cardiology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="doctor@sonatrach.dz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+213 12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Select a department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Building 4, Floor 2, Office 201" {...field} />
                    </FormControl>
                    <FormDescription>
                      Physical location within the facility
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of professional background and specialties" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a short professional biography
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Doctor is currently available for appointments
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <CardFooter className="flex justify-end px-0 pb-0">
                <Button
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/doctors")}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Doctor'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AddDoctorPage;
