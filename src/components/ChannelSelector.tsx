
import { MessageCircle, Smartphone, Globe, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ChannelSelectorProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
}

const channels = [
  { id: 'web', name: 'Website', icon: Globe, color: 'bg-blue-500', description: 'Chat no site' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', description: 'WhatsApp Business' },
  { id: 'sms', name: 'SMS', icon: Smartphone, color: 'bg-purple-500', description: 'Mensagens SMS' },
  { id: 'email', name: 'Email', icon: Mail, color: 'bg-orange-500', description: 'Suporte por email' },
];

export const ChannelSelector = ({ selectedChannel, onChannelChange }: ChannelSelectorProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📱 Canais de Atendimento
          <span className="text-sm font-normal text-gray-500">(Selecione para testar)</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isSelected = selectedChannel === channel.id;
            
            return (
              <button
                key={channel.id}
                onClick={() => onChannelChange(channel.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-8 h-8 ${channel.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-800">{channel.name}</div>
                <div className="text-xs text-gray-500 mt-1">{channel.description}</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
