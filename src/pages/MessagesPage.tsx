
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Send, Plus, User, Clock, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const MessagesPage = () => {
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<number | null>(1); // Default to first contact
  const [newMessage, setNewMessage] = useState('');
  
  // Mock data
  const contacts = [
    {
      id: 1,
      name: userRole === 'patient' ? 'Dr. Mohammed Ali' : 'Ahmed Boulmerka',
      lastMessage: 'Thank you for your appointment yesterday.',
      time: '10:30 AM',
      unread: 0,
      avatar: userRole === 'patient' ? 'MA' : 'AB'
    },
    {
      id: 2,
      name: userRole === 'patient' ? 'Dr. Fatima Zahra' : 'Samira Hamdani',
      lastMessage: 'Please confirm your appointment for tomorrow.',
      time: 'Yesterday',
      unread: 2,
      avatar: userRole === 'patient' ? 'FZ' : 'SH'
    },
    {
      id: 3,
      name: userRole === 'patient' ? 'Sonatrach Health Department' : 'Ibrahim Nacer',
      lastMessage: 'Your annual check-up is due next month.',
      time: 'Mar 10',
      unread: 0,
      avatar: userRole === 'patient' ? 'SH' : 'IN'
    }
  ];
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Chat messages for selected contact
  const messages = [
    {
      id: 1,
      contactId: 1,
      sender: 'contact',
      content: 'Good morning, how are you feeling today after our appointment?',
      time: '09:45 AM'
    },
    {
      id: 2,
      contactId: 1,
      sender: 'user',
      content: 'I\'m feeling much better, thank you doctor.',
      time: '10:00 AM'
    },
    {
      id: 3,
      contactId: 1,
      sender: 'contact',
      content: 'That\'s great to hear! Remember to take your medication as prescribed.',
      time: '10:15 AM'
    },
    {
      id: 4,
      contactId: 1,
      sender: 'user',
      content: 'Yes, I\'ve been following your instructions carefully.',
      time: '10:20 AM'
    },
    {
      id: 5,
      contactId: 1,
      sender: 'contact',
      content: 'Thank you for your appointment yesterday.',
      time: '10:30 AM'
    },
    {
      id: 6,
      contactId: 2,
      sender: 'contact',
      content: 'Hello, this is to remind you of your appointment tomorrow at 2:30 PM.',
      time: 'Yesterday, 2:00 PM'
    },
    {
      id: 7,
      contactId: 2,
      sender: 'contact',
      content: 'Please confirm your appointment for tomorrow.',
      time: 'Yesterday, 2:10 PM'
    },
    {
      id: 8,
      contactId: 3,
      sender: 'contact',
      content: 'Your annual check-up is due next month.',
      time: 'Mar 10, 11:30 AM'
    }
  ];
  
  const currentContactMessages = messages.filter(
    message => message.contactId === selectedContact
  );
  
  const selectedContactData = contacts.find(contact => contact.id === selectedContact);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Logic to send message would go here
    // For now we just clear the input
    setNewMessage('');
  };
  
  return (
    <AppLayout title="Messages">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Contacts</CardTitle>
                <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <ScrollArea className="h-full">
                <div className="px-4 pt-2 pb-4 space-y-1">
                  {filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                        contact.id === selectedContact 
                          ? 'bg-medsuite-secondary' 
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-medsuite-primary text-white">
                          {contact.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium truncate">{contact.name}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{contact.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <Badge className="bg-medsuite-primary text-white ml-auto">
                          {contact.unread}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedContact ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-medsuite-primary text-white">
                        {selectedContactData?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <CardTitle className="text-base">{selectedContactData?.name}</CardTitle>
                      <CardDescription>Online now</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                  <ScrollArea className="h-[calc(100%-120px)] pt-4 px-4">
                    <div className="space-y-4">
                      {currentContactMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] px-4 py-2 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-medsuite-primary text-white rounded-br-none'
                                : 'bg-secondary rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span className={`text-xs block text-right mt-1 ${
                              message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                            }`}>
                              {message.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t mt-auto">
                    <form 
                      className="flex items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full"
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="submit"
                        className="rounded-full h-10 w-10 p-0"
                        disabled={newMessage.trim() === ''}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex h-full items-center justify-center flex-col p-6 text-center">
                <div className="rounded-full bg-muted p-6">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-medium">Select a contact</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Choose a contact to start messaging
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default MessagesPage;
