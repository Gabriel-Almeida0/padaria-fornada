// Dados da loja (fictícios). Fonte: data-model.md. Importado pelos testes: caminho relativo com .ts.
import type { Loja } from '../lib/tipos.ts'

const enderecoTexto = 'Rua do Fermento, 212, Vila Serena, São Paulo, SP'

export const loja: Loja = {
  nome: 'Fornada',
  marca: 'Fornada Padaria',
  whatsapp: '5511900000000',
  whatsappExibicao: '(11) 90000-0000',
  endereco: {
    rua: 'Rua do Fermento',
    numero: '212',
    bairro: 'Vila Serena',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '00000-000',
  },
  mapaUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoTexto)}`,
  fuso: 'America/Sao_Paulo',
  horarios: {
    0: { abre: 420, fecha: 780 }, // domingo, 7h às 13h
    1: { abre: 420, fecha: 1200 }, // segunda a sábado, 7h às 20h
    2: { abre: 420, fecha: 1200 },
    3: { abre: 420, fecha: 1200 },
    4: { abre: 420, fecha: 1200 },
    5: { abre: 420, fecha: 1200 },
    6: { abre: 420, fecha: 1200 },
  },
  preparoMin: { retirada: 20, entrega: 40 },
  encomendaAntecedenciaH: 48,
  encomendaJanelaDias: 14,
  pedidoMinimoEntrega: 4000,
  bairros: [
    { id: 'vila-serena', nome: 'Vila Serena', taxa: 500, tempoMin: 25 },
    { id: 'jardim-das-flores', nome: 'Jardim das Flores', taxa: 700, tempoMin: 35 },
    { id: 'alto-do-moinho', nome: 'Alto do Moinho', taxa: 800, tempoMin: 40 },
    { id: 'parque-dos-ipes', nome: 'Parque dos Ipês', taxa: 1000, tempoMin: 45 },
    { id: 'recanto-azul', nome: 'Recanto Azul', taxa: 1200, tempoMin: 55 },
  ],
}

