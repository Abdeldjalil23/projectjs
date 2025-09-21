
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export const ResourcesSummary = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Allocate staff and resources across medical departments
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">96</div>
                <div className="text-sm text-muted-foreground mt-1">Across all departments</div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <div className="text-sm font-medium">Doctors</div>
                    <div>31</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Support Staff</div>
                    <div>65</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Equipment Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">72%</div>
                <div className="text-sm text-muted-foreground mt-1">Average across facilities</div>
                <div className="space-y-2 mt-2">
                  <div className="space-y-1">
                    <div className="text-xs flex justify-between">
                      <span>Medical Center 1</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-1" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs flex justify-between">
                      <span>Medical Center 2</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Budget Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground mt-1">Of annual budget utilized</div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <div className="text-sm font-medium">Equipment</div>
                    <div>42%</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Operations</div>
                    <div>47%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resource Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">14</div>
                <div className="text-sm text-muted-foreground mt-1">Pending approval</div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <div className="text-sm font-medium">Equipment</div>
                    <div>8</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Staff</div>
                    <div>6</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">View Resource Report</Button>
            <Button>Manage Resources</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesSummary;
