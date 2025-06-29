import { Bot, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[90%] ${isBot ? 'order-2' : 'order-1'}`}>
        <div className={`p-3 rounded-2xl ${
          isBot 
            ? 'bg-gray-100 text-gray-800 rounded-bl-sm' 
            : 'bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-br-sm'
        }`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
          isBot ? 'justify-start' : 'justify-end'
        }`}>
          <Clock className="w-3 h-3" />
          {format(message.timestamp, 'HH:mm', { locale: ptBR })}
        </div>
      </div>
      
      {!isBot && (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
