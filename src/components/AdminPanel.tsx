import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Clock, TrendingUp, Bot, AlertCircle } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
// @ts-ignore
import nlp from 'compromise';

interface ChatAnalytics {
  totalMessages: number;
  totalUsers: number;
  averageResponseTime: number;
  satisfactionRate: number;
  topIntentions: Array<{ name: string; count: number; percentage: number }>;
  channelDistribution: Array<{ name: string; value: number; color: string }>;
  hourlyActivity: Array<{ hour: string; messages: number }>;
}

export const AdminPanel = () => {
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = () => {
      const mockAnalytics: ChatAnalytics = {
        totalMessages: 1247,
        totalUsers: 334,
        averageResponseTime: 1.2,
        satisfactionRate: 94.5,
        topIntentions: [
          { name: 'Consulta de Pedido', count: 456, percentage: 36.6 },
          { name: 'FAQ Geral', count: 312, percentage: 25.0 },
          { name: 'Suporte Técnico', count: 234, percentage: 18.8 },
          { name: 'Agendamento', count: 156, percentage: 12.5 },
          { name: 'Outros', count: 89, percentage: 7.1 },
        ],
        channelDistribution: [
          { name: 'WhatsApp', value: 45, color: '#25D366' },
          { name: 'Website', value: 30, color: '#3B82F6' },
          { name: 'SMS', value: 15, color: '#8B5CF6' },
          { name: 'Email', value: 10, color: '#F59E0B' },
        ],
        hourlyActivity: [
          { hour: '09h', messages: 45 },
          { hour: '10h', messages: 67 },
          { hour: '11h', messages: 89 },
          { hour: '12h', messages: 78 },
          { hour: '13h', messages: 56 },
          { hour: '14h', messages: 94 },
          { hour: '15h', messages: 112 },
          { hour: '16h', messages: 98 },
          { hour: '17h', messages: 87 },
          { hour: '18h', messages: 65 },
        ],
      };

      const mockLogs = [
        { id: 1, user: 'João Silva', channel: 'WhatsApp', intention: 'Consulta de Pedido', status: 'Resolvido', time: '14:32' },
        { id: 2, user: 'Maria Santos', channel: 'Website', intention: 'FAQ Geral', status: 'Resolvido', time: '14:28' },
        { id: 3, user: 'Pedro Costa', channel: 'SMS', intention: 'Suporte Técnico', status: 'Encaminhado', time: '14:25' },
        { id: 4, user: 'Ana Lima', channel: 'WhatsApp', intention: 'Agendamento', status: 'Resolvido', time: '14:20' },
        { id: 5, user: 'Carlos Oliveira', channel: 'Website', intention: 'Consulta de Pedido', status: 'Resolvido', time: '14:15' },
      ];

      setAnalytics(mockAnalytics);
      setRecentLogs(mockLogs);
    };

    loadAnalytics();
  }, []);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Painel Administrativo</h2>
        <p className="text-gray-600">Monitoramento em tempo real do Chatbot</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalMessages.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Mensagens Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalUsers}</p>
                <p className="text-sm text-gray-600">Usuários Únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{analytics.averageResponseTime}s</p>
                <p className="text-sm text-gray-600">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{analytics.satisfactionRate}%</p>
                <p className="text-sm text-gray-600">Satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 Atividade por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📱 Distribuição por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.channelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Intentions and Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              🎯 Principais Intenções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topIntentions.map((intention, index) => (
                <div key={intention.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{intention.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{intention.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${intention.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{intention.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              📋 Logs Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{log.user}</p>
                    <p className="text-sm text-gray-600">{log.intention}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'Resolvido' ? 'default' : 'secondary'}>
                      {log.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{log.channel} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
