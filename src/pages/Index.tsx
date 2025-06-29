
import { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { AdminPanel } from '../components/AdminPanel';
import { Header } from '../components/Header';
import { ChannelSelector } from '../components/ChannelSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState('web');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            🌟 Chatbot
          </h1>
          <p className="text-xl text-gray-600">Assistente Inteligente Multicanal</p>
          <p className="text-sm text-gray-500 mt-2">Atendimento encantador com IA e integração real</p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              💬 Chat Interface
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              📊 Painel Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <ChannelSelector 
              selectedChannel={selectedChannel} 
              onChannelChange={setSelectedChannel} 
            />
            <ChatInterface channel={selectedChannel} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
