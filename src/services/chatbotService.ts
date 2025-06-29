import { analyzeTextWithNLP } from '@/utils/nlpHelper';
import { remove as removeAccents } from 'diacritics';


interface OrderStatus {
  id: string;
  status: string;
  description: string;
  lastUpdate: string;
}

class ChatbotService {
  private intentions = {
    greeting: /^(oi+|ola+|olá+|hello+|hi+|bom\s?dia+|bomdia+|boa\s?tarde+|boatarde+|boa\s?noite+|boanoite+|eai+|e aí+|salve+|opa+)/i,
    orderQuery: /(pedido+s*|pedio+s*|consulta de pedido|consultar pedido|status|rastreio|rastreiar|onde\s?est[aá]+|ondeesta+|meu\s?pedido+|meupedido+)/i,
    faq: /(horario+s*|horário+s*|funcionamento|contato+s*|telefone+s*|falar+|atendimento+)/i,
    scheduling: /(agendar+|agendamento+|marcar+|marcacao+|marcação+|agenda+|reuniao+|reunião+|consulta de horario|consultar horario|horario disponivel|disponivel+|disponível+)/i,
    support: /(problema+s*|erro+s*|suporte+|tecnico+|técnico+|nao\s?funciona+|não\s?funciona+|bug+|falha+|travou+|travar+|naofunciona+|ajuda+|socorro+)/i,
    goodbye: /(tchau+|adeus+|obrigado+|obg+|vlw+|valeu+|ate\s?logo+|até\s?logo+|bye+|flw+|fui+|ate+|até+)/i,
  };


  private availableSchedule = {
    'terça': ['14h', '16h'],
    'quarta': ['10h', '15h', '17h'],
    'quinta': ['9h', '14h'],
    'sexta': ['11h', '16h'],
  };

  private invalidScheduleLogs: { userInput: string; normalized: string; timestamp: Date }[] = [];

  private normalizeText(text: string): string {
    return removeAccents(text.toLowerCase().trim());
  }

  async processMessage(message: string, channel: string): Promise<string> {
    console.log(`Processing message: "${message}" via ${channel}`);

    // Etapa 1: tentativa de detecção com regex
    for (const [intent, pattern] of Object.entries(this.intentions)) {
      if (pattern.test(message)) {
        return await this.generateResponse(intent, message, channel);
      }
    }

    // Etapa 2: reforço com NLP (compromise)
    const { keywords, normalized } = analyzeTextWithNLP(message);

    if (keywords.includes('pedido') || keywords.includes('compra')) {
      return await this.generateResponse('orderQuery', message, channel);
    }

    if (keywords.includes('agenda') || keywords.includes('horário') || keywords.includes('reunião')) {
      return this.generateResponse('scheduling', message, channel);
    }

    if (keywords.includes('problema') || keywords.includes('erro')) {
      return this.generateResponse('support', message, channel);
    }

    // NOVO: Verificação extra para agendamento por padrão de dia + horário
    const dias = Object.keys(this.availableSchedule);
    const normMsg = this.normalizeText(message);

    for (const dia of dias) {
      const diaNorm = this.normalizeText(dia);
      const diaNormFeira = diaNorm.endsWith('a') ? diaNorm + '-feira' : diaNorm;
      if (normMsg.includes(diaNorm) || normMsg.includes(diaNormFeira)) {
        for (const h of this.availableSchedule[dia]) {
          const horarioNorm = this.normalizeText(h);
          // Expressão regular para encontrar o par dia e horário juntos, em qualquer ordem
          const pattern = new RegExp(`\\b(${diaNorm}|${diaNormFeira})\\s*[-]?\\s*${horarioNorm}\\b|\\b${horarioNorm}\\s*[-]?\\s*(${diaNorm}|${diaNormFeira})\\b`);
          if (pattern.test(normMsg)) {
            // Chama diretamente a resposta de agendamento
            return this.getSchedulingResponse(message);
          }
        }
        // Se o dia foi encontrado mas nenhum horário válido
        return this.getSchedulingResponse(message);
      }
    }

    // Etapa 3: fallback
    return this.generateFallbackResponse(channel);
  }


  private async generateResponse(intent: string, message: string, channel: string): Promise<string> {
    switch (intent) {
      case 'greeting':
        return this.getGreetingResponse(channel);
      
      case 'orderQuery':
        return await this.handleOrderQuery(message);
      
      case 'faq':
        return this.getFAQResponse(message);
      
      case 'scheduling':
        return this.getSchedulingResponse(message);
      
      case 'support':
        return this.getSupportResponse(channel);
      
      case 'goodbye':
        return this.getGoodbyeResponse();
      
      default:
        return this.generateFallbackResponse(channel);
    }
  }

  private getGreetingResponse(channel: string): string {
    const responses = [
      `👋 Olá! Sou o Chatbot, seu assistente via ${this.getChannelName(channel)}! Em que posso ajudá-lo hoje?`,
      `🌟 Oi! Que bom ter você aqui! Como posso tornar seu dia melhor?`,
      `😊 Olá! Estou aqui para ajudar com informações, consultas de pedidos e muito mais!`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async handleOrderQuery(message: string): Promise<string> {
    // Extract potential order ID from message
    const orderIdMatch = message.match(/\d{3,}/);
    
    if (orderIdMatch) {
      const orderId = orderIdMatch[0];
      try {
        // Simulate API call to check order status
        const orderStatus = await this.fetchOrderStatus(orderId);
        return `📦 Status do pedido #${orderId}:\n\n🔍 ${orderStatus.status}\n📋 ${orderStatus.description}\n🕐 Última atualização: ${orderStatus.lastUpdate}\n\n✨ Algo mais em que posso ajudar?`;
      } catch (error) {
        return `❌ Não consegui encontrar informações sobre o pedido #${orderId}. Verifique se o número está correto ou tente novamente em alguns minutos.`;
      }
    }
    
    return `🔍 Para consultar seu pedido, me informe o número (ex: "status do pedido 12345"). \n\n💡 Dica: O número do pedido geralmente tem 4-6 dígitos e está no seu email de confirmação!`;
  }

  private async fetchOrderStatus(orderId: string): Promise<OrderStatus> {
    // Simulate API call with JSONPlaceholder-like response
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const statuses = [
      { status: 'Em Preparação', description: 'Seu pedido está sendo preparado com carinho pela nossa equipe', lastUpdate: 'Hoje às 09:30' },
      { status: 'Em Transporte', description: 'Saiu para entrega! Chegará em breve no seu endereço', lastUpdate: 'Hoje às 11:45' },
      { status: 'Entregue', description: 'Pedido entregue com sucesso! Esperamos que goste 😊', lastUpdate: 'Ontem às 16:20' },
      { status: 'Aguardando Pagamento', description: 'Aguardando confirmação do pagamento para processar seu pedido', lastUpdate: 'Hoje às 08:15' },
    ];
    
    return {
      id: orderId,
      ...statuses[Math.floor(Math.random() * statuses.length)]
    };
  }

  private getFAQResponse(message: string): string {
    const normalized = this.normalizeText(message);

    if (normalized.includes('pedido') || normalized.includes('consultar pedido') || normalized.includes('consulta')) {
      return `📦 Para consultar pedidos, me envie o número do pedido ou diga \"status do pedido 1234\".`;
    }

    if (normalized.includes('horario') || normalized.includes('funcionamento')) {
      return `🕐 Nosso horário de funcionamento:\n\n📞 Atendimento: Segunda a Sexta, 8h às 18h\n🤖 Chatbot: 24h por dia, 7 dias por semana!\n📱 WhatsApp: Segunda a Sábado, 8h às 20h\n\n✨ Estou sempre aqui para ajudar!`;
    }

    if (normalized.includes('contato') || normalized.includes('telefone')) {
      return `📞 Formas de contato:\n\n🤖 Chat inteligente (aqui mesmo!)\n📱 WhatsApp: (11) 9999-9999\n📧 Email: contato@empresa.com\n🌐 Site: www.empresa.com\n\n💬 Prefere continuar comigo? Posso resolver a maioria das suas dúvidas!`;
    }

    if (normalized.includes('agendamento') || normalized.includes('agendar') || normalized.includes('marcar')) {
      return `📅 Para agendar, me diga o dia e horário desejado (ex: \"terça 14h"). Veja os horários disponíveis acima!`;
    }

    if (normalized.includes('suporte') || normalized.includes('problema') || normalized.includes('erro')) {
      return `🛠️ Suporte técnico ativado!\n\n🔧 Posso ajudar com problemas comuns:\n• Login e senhas\n• Navegação no site\n• Problemas de pedidos\n• Dúvidas sobre produtos\n\n🎯 Descreva seu problema que vou buscar a melhor solução!`;
    }

    // Resposta padrão
    return `💡 Posso ajudar com:\n\n📦 Consulta de pedidos\n🕐 Horários de funcionamento\n📞 Informações de contato\n📅 Agendamentos\n🛠️ Suporte técnico\n\n❓ Me conte mais sobre o que precisa!`;
  }

 
  private getSchedulingResponse(userInput?: string): string {
    const agendarPalavras = [
      'agendar', 'agendamento', 'marcar', 'quero marcar', 'quero agendar',
      'quero um horário', 'quero horario', 'quero marcar horario'
    ];
  
    const disponibilidade = `📅 Agendamento disponível!\n\n🗓️ Horários livres esta semana:
  • Terça: 14h, 16h
  • Quarta: 10h, 15h, 17h
  • Quinta: 9h, 14h
  • Sexta: 11h, 16h
  
  📞 Para confirmar, ligue (11) 9999-9999 ou continue aqui comigo!
  
  ⏰ Qual horário prefere?`;
  
    if (!userInput || agendarPalavras.some(p => this.normalizeText(userInput).includes(this.normalizeText(p)))) {
      return disponibilidade;
    }
  
    const normalized = this.normalizeText(userInput);
  
    for (const [dia, horarios] of Object.entries(this.availableSchedule)) {
      const diaNorm = this.normalizeText(dia); // exemplo: "quinta"
      const diaNormFeira = diaNorm.endsWith('a') ? diaNorm + '-feira' : diaNorm; // exemplo: "quinta-feira"
      for (const h of horarios) {
        const horarioNorm = this.normalizeText(h); // ex: "14h"
        // Expressão regular para encontrar o par dia e horário juntos, em qualquer ordem, ignorando espaços extras
        const pattern = new RegExp(`\\b(${diaNorm}|${diaNormFeira})\\s*[-]?\\s*${horarioNorm}\\b|\\b${horarioNorm}\\s*[-]?\\s*(${diaNorm}|${diaNormFeira})\\b`);
        if (pattern.test(normalized)) {
          return `✅ Agendamento confirmado para ${dia.charAt(0).toUpperCase() + dia.slice(1)} às ${h}! Se precisar alterar, me avise.`;
        }
      }
      // se o dia foi encontrado mas nenhum horário válido
      if (normalized.includes(diaNorm) || normalized.includes(diaNormFeira)) {
        return `❌ Horário não disponível para ${dia.charAt(0).toUpperCase() + dia.slice(1)}. Disponíveis: ${horarios.join(', ')}.`;
      }
    }
    // se nenhum dia reconhecido
    return `❌ Horário não disponível. Veja os horários livres acima.\n\n${disponibilidade}`;
  }
veja    





  private getSupportResponse(channel: string): string {
    return `🛠️ Suporte técnico ativado!\n\n🔧 Posso ajudar com problemas comuns:\n• Login e senhas\n• Navegação no site\n• Problemas de pedidos\n• Dúvidas sobre produtos\n\n🎯 Descreva seu problema que vou buscar a melhor solução!\n\n📞 Para casos complexos, posso conectar você com nossa equipe especializada.`;
  }

  private getGoodbyeResponse(): string {
    const responses = [
      `👋 Foi um prazer ajudar! Volte sempre que precisar! ✨`,
      `😊 Tchau! Espero ter ajudado! Estarei aqui quando precisar! 🌟`,
      `🤖 Até logo! Lembre-se: estou sempre aqui, 24h por dia! 💙`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateFallbackResponse(channel: string): string {
    const responses = [
      `🤔 Hmm, não entendi muito bem. Pode reformular sua pergunta? Estou aqui para ajudar da melhor forma!`,
      `💭 Interessante! Ainda estou aprendendo sobre esse assunto. Que tal me contar mais detalhes?`,
      `🎯 Vou melhorar minha compreensão! Por enquanto, posso ajudar com consultas de pedidos, horários, agendamentos e informações gerais.`,
      `✨ Desculpe, não captei essa. Sou especialista em pedidos, informações e suporte geral. Como posso ajudar especificamente?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getChannelName(channel: string): string {
    const names = {
      web: 'Website',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Email'
    };
    return names[channel as keyof typeof names] || 'Chat';
  }

  public getInvalidScheduleLogs() {
    return this.invalidScheduleLogs;
  }
}

export const chatbotService = new ChatbotService();
