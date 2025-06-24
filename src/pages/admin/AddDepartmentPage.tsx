
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X, Building2, MapPin, Phone, Mail, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Department name must be at least 3 characters' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters' }),
  contactPhone: z.string().min(8, { message: 'Phone number must be at least 8 characters' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address' }),
  manager: z.string().min(3, { message: 'Manager name is required' }),
  description: z.string().optional(),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const AddDepartmentPage = () => {
  const { toast } = useToast();
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      contactPhone: '',
      contactEmail: '',
      manager: '',
      description: '',
      notes: ''
    }
  });

  const onSubmit = (data: FormValues) => {
    // In a real application, this would send data to an API
    console.log('Form data:', { ...data, specialties });
    
    toast({
      title: "Department Added",
      description: `${data.name} has been successfully created.`,
    });

    // Reset form after submission
    form.reset();
    setSpecialties([]);
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() !== '' && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(item => item !== specialty));
  };

  return (
    <AppLayout title="Add Department">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-sonatrach-orange" />
              <div>
                <CardTitle>Add New Department</CardTitle>
                <CardDescription>Create a new medical department or facility</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The official name of the department or facility
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter location" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Physical location of the department
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="+213 XXX XXXXX" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="department@sonatrach.dz" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department Manager</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Manager name" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Person responsible for this department
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label htmlFor="specialties">Department Specialties</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="specialties"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        placeholder="Add specialty"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSpecialty();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSpecialty} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="gap-1">
                          {specialty}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(specialty)}
                            className="text-muted-foreground hover:text-foreground rounded-full"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {specialty}</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {specialties.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No specialties added yet. Add at least one specialty.
                      </p>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a detailed description of the department" 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the department's purpose and services
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes or information" 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional details, special requirements, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => form.reset()}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Department
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddDepartmentPage;
