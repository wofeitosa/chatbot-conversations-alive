import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { useToast } from '@/hooks/use-toast';
import { chatbotService } from '../services/chatbotService';

interface ChatInterfaceProps {
  channel: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

export const ChatInterface = ({ channel }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('chatTheme') || 'light');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when channel changes
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: `👋 Olá! Sou o Chatbot, seu assistente inteligente via ${getChannelName(channel)}. Qual é o seu nome?`,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setUserName(null);
  }, [channel]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('chatTheme', theme);
  }, [theme]);

  const getChannelName = (channel: string) => {
    const names = {
      web: 'Website',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Email'
    };
    return names[channel as keyof typeof names] || 'Chat';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Se ainda não temos o nome do usuário, salvar e responder personalizado
      if (!userName) {
        // Extrai o nome removendo palavras comuns e capitalizando
        let name = inputText.trim().toLowerCase();
        name = name.replace(/(meu nome e|meu nome é|me chamo|sou|nome|é|oi|olá|ola|eu sou|me chama|meu nome)/gi, '').trim();
        // Pega a última palavra se ainda houver mais de uma
        if (name.split(' ').length > 1) {
          name = name.split(' ').pop() || name;
        }
        // Capitaliza a primeira letra
        name = name.charAt(0).toUpperCase() + name.slice(1);
        setUserName(name);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Prazer, ${name}! Como posso ajudar você hoje?`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const botResponse = await chatbotService.processMessage(inputText, channel);
      // Personalizar resposta se possível
      const personalizedResponse = userName ? botResponse.replace('Olá!', `Olá, ${userName}!`) : botResponse;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: personalizedResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      // Log interaction for admin panel
      console.log('Chat interaction:', { userMessage, botMessage, channel });
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Erro na conversa",
        description: "Houve um problema ao processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`h-[600px] flex flex-col shadow-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <CardHeader className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gradient-to-r from-blue-500 to-green-500 text-white'} rounded-t-lg flex items-center relative`}>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Chatbot - {getChannelName(channel)}
          <div className="ml-8 flex items-center gap-1 text-sm opacity-90">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            Online
          </div>
        </CardTitle>
        <div className="absolute top-3 right-4 z-10">
          <label
            htmlFor="theme-toggle"
            className="w-10 h-5 bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-full flex items-center transition-colors duration-300 cursor-pointer relative"
          >
            <input
              id="theme-toggle"
              type="checkbox"
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="sr-only peer"
              aria-label="Alternar tema claro/escuro"
            />
            <span
              className="absolute top-1/2 left-[2px] w-3 h-3 rounded-full shadow-md transition-transform duration-300 bg-gradient-to-r from-blue-500 to-cyan-400 peer-checked:from-green-400 peer-checked:to-green-600 peer-checked:translate-x-5 -translate-y-1/2"
            ></span>
          </label>
        </div>

      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500">
              <Bot className="w-4 h-4" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">Chatbot está digitando...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Pressione Enter para enviar • IA com integração real
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
