import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  FileText, 
  BookOpen, 
  Video, 
  Link, 
  Download,
  Eye,
  Calendar,
  User,
  Heart,
  Shield,
  Users,
  Bookmark,
  Share2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for resources
const resources = [
  {
    id: 1,
    title: 'Mental Health First Aid Guide',
    type: 'Guide',
    category: 'Mental Health',
    format: 'PDF',
    fileSize: '2.1 MB',
    uploadDate: '2024-01-15',
    author: 'Dr. Sarah Johnson',
    downloads: 156,
    description: 'Comprehensive guide for providing mental health first aid to employees in crisis situations.',
    tags: ['mental-health', 'crisis', 'first-aid']
  },
  {
    id: 2,
    title: 'Stress Management Techniques',
    type: 'Video',
    category: 'Wellness',
    format: 'MP4',
    fileSize: '45.2 MB',
    uploadDate: '2024-01-10',
    author: 'Dr. Sarah Johnson',
    downloads: 89,
    description: 'Video series covering various stress management techniques and relaxation exercises.',
    tags: ['stress', 'wellness', 'relaxation']
  },
  {
    id: 3,
    title: 'Family Counseling Best Practices',
    type: 'Document',
    category: 'Counseling',
    format: 'DOCX',
    fileSize: '1.8 MB',
    uploadDate: '2024-01-08',
    author: 'Dr. Sarah Johnson',
    downloads: 67,
    description: 'Best practices and guidelines for conducting effective family counseling sessions.',
    tags: ['counseling', 'family', 'guidelines']
  },
  {
    id: 4,
    title: 'Employee Wellness Program Handbook',
    type: 'Handbook',
    category: 'Wellness',
    format: 'PDF',
    fileSize: '5.3 MB',
    uploadDate: '2024-01-05',
    author: 'Dr. Sarah Johnson',
    downloads: 234,
    description: 'Complete handbook for implementing and managing employee wellness programs.',
    tags: ['wellness', 'program', 'handbook']
  },
  {
    id: 5,
    title: 'Crisis Intervention Protocols',
    type: 'Protocol',
    category: 'Emergency',
    format: 'PDF',
    fileSize: '1.2 MB',
    uploadDate: '2024-01-12',
    author: 'Dr. Sarah Johnson',
    downloads: 123,
    description: 'Standard protocols for crisis intervention and emergency response procedures.',
    tags: ['crisis', 'emergency', 'protocols']
  },
  {
    id: 6,
    title: 'Peer Support Training Materials',
    type: 'Training',
    category: 'Support',
    format: 'ZIP',
    fileSize: '12.5 MB',
    uploadDate: '2024-01-03',
    author: 'Dr. Sarah Johnson',
    downloads: 45,
    description: 'Complete training materials for establishing and maintaining peer support groups.',
    tags: ['peer-support', 'training', 'groups']
  }
];

const SocialResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Guide': return <BookOpen className="h-4 w-4" />;
      case 'Video': return <Video className="h-4 w-4" />;
      case 'Document': return <FileText className="h-4 w-4" />;
      case 'Handbook': return <BookOpen className="h-4 w-4" />;
      case 'Protocol': return <Shield className="h-4 w-4" />;
      case 'Training': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mental Health': return <Heart className="h-4 w-4" />;
      case 'Wellness': return <TrendingUp className="h-4 w-4" />;
      case 'Counseling': return <Users className="h-4 w-4" />;
      case 'Emergency': return <AlertCircle className="h-4 w-4" />;
      case 'Support': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <AppLayout title="Social Resources">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Resources",
              value: resources.length,
              icon: <FileText className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Total Downloads",
              value: resources.reduce((sum, resource) => sum + resource.downloads, 0),
              icon: <Download className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Categories",
              value: new Set(resources.map(r => r.category)).size,
              icon: <BookOpen className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Formats",
              value: new Set(resources.map(r => r.format)).size,
              icon: <Link className="h-5 w-5 text-medsuite-primary" />,
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="stats-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex justify-between items-center p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className="p-3 bg-medsuite-secondary rounded-full shadow-sm">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <CardTitle className="text-xl">Resource Library</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Access and manage social work resources, guides, and training materials
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources, tags, or descriptions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Mental Health">Mental Health</SelectItem>
                  <SelectItem value="Wellness">Wellness</SelectItem>
                  <SelectItem value="Counseling">Counseling</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Handbook">Handbook</SelectItem>
                  <SelectItem value="Protocol">Protocol</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resources Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getCategoryIcon(resource.category)}
                      <span>{resource.category}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {resource.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {resource.uploadDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="h-3 w-3" />
                        {resource.downloads} downloads
                      </div>
                      <div className="text-muted-foreground">
                        {resource.fileSize}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No resources found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SocialResourcesPage; 