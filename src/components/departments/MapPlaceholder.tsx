
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';

export const MapPlaceholder = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="bg-muted h-[400px] rounded-md flex items-center justify-center">
          <div className="text-center">
            <Map className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-medium text-lg">Interactive Map View</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              This feature would display an interactive map showing the locations of all 
              medical facilities and departments across Sonatrach operations.
            </p>
            <Button className="mt-4">Enable Map View</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapPlaceholder;
