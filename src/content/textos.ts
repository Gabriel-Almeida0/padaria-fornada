// Textos do site, escritos do zero para a Fornada (padaria fictícia na Vila Serena, São Paulo).
// Componentes não têm strings de negócio literais: tudo sai daqui.
// Importável pelo Node nos testes: caminho relativo com .ts, sem alias.
import { loja } from './loja.ts'

export const textos = {
  acessibilidade: {
    pularParaConteudo: 'Pular para o conteúdo',
  },

  meta: {
    titulo: 'Fornada Padaria · pão de fermentação natural na Vila Serena',
    descricao:
      'Padaria de bairro na Vila Serena, em São Paulo. Pão de fermentação natural, folhados e bolos por encomenda. Monte o pedido no site e mande pelo WhatsApp.',
  },

  navegacao: [
    { rotulo: 'Cardápio', href: '#cardapio' },
    { rotulo: 'Encomendas', href: '#encomendas' },
    { rotulo: 'Entrega', href: '#entrega' },
    { rotulo: 'Sobre', href: '#sobre' },
    { rotulo: 'Onde estamos', href: '#onde-estamos' },
  ],

  header: {
    abrirMenu: 'Abrir menu',
    menu: 'Menu',
    fecharMenu: 'Fechar menu',
    falarNoWhatsApp: 'Falar no WhatsApp',
    resumoHorario: 'Seg a sáb, 7h às 20h · Dom, 7h às 13h',
  },

  hero: {
    kicker: 'Padaria de bairro · Vila Serena',
    titulo: 'Pão de verdade, saindo agora',
    destaque: 'de verdade',
    apoio:
      'Massa com tempo, forno quente desde as cinco da manhã e gente que conhece o seu pedido de cor. Escolha aqui, a gente separa e você recebe a confirmação pelo WhatsApp.',
    ctaPrincipal: 'Fazer pedido',
    ctaSecundario: 'Encomendar bolo ou cesta',
  },

  queridinhos: {
    kicker: 'Mais pedidos',
    titulo: 'Os mais pedidos',
    destaque: 'da casa',
    apoio: 'O que o bairro leva todo dia. Se é sua primeira vez, comece por aqui.',
  },

  cardapio: {
    kicker: 'Cardápio',
    titulo: 'Tudo o que sai do forno',
    destaque: 'forno',
    apoio: 'Preço de balcão, sem surpresa. Toque em "Adicionar" e continue olhando: a sacola guarda tudo.',
    categorias: 'Categorias do cardápio',
    linkEncomendas: 'Bolos e cestas por encomenda →',
    semJs: 'Prefere pedir direto? Mande uma mensagem no WhatsApp',
  },

  encomendas: {
    comoFunciona: 'Como funciona',
    kicker: 'Encomendas',
    titulo: 'Bolo para a festa, cesta para presentear',
    destaque: 'presentear',
    apoio: `Tudo feito para o seu dia, com ${loja.encomendaAntecedenciaH} horas de antecedência. Escolha o tamanho, a data e, se quiser, a mensagem do cartão.`,
    passos: [
      { titulo: 'Escolha', texto: 'Bolo ou cesta, no tamanho que serve a sua mesa.' },
      {
        titulo: 'Marque a data',
        texto: `A partir de ${loja.encomendaAntecedenciaH} horas, em qualquer dia de funcionamento.`,
      },
      { titulo: 'Confirme no WhatsApp', texto: 'O pedido chega pronto para a gente. É só tocar em enviar.' },
    ],
    prazoCurto: 'Precisa para antes de 48 horas? Fale com a gente, às vezes dá.',
  },

  entrega: {
    bairrosAtendidos: 'Bairros atendidos',
    minutos: (n: number) => `${n} min`,
    kicker: 'Entrega e retirada',
    titulo: 'Chega quentinho aqui por perto',
    destaque: 'quentinho',
    apoio: 'Entregamos nos bairros vizinhos com bicicleta e moto da casa. Retirar na loja não custa nada.',
    rotuloBairro: 'Bairro',
    rotuloTaxa: 'Taxa',
    rotuloTempo: 'Tempo médio',
    minimo: 'Pedido mínimo para entrega',
    retirada: 'Retirada na loja',
    retiradaDetalhe: `Sem taxa. Fica pronto em cerca de ${loja.preparoMin.retirada} minutos.`,
    outroBairro: 'Seu bairro não está aqui? Combine com a gente pelo WhatsApp.',
  },

  sobre: {
    kicker: 'Sobre a Fornada',
    titulo: 'Uma padaria que acorda antes da rua',
    destaque: 'antes da rua',
    paragrafos: [
      'A Fornada abriu numa esquina da Vila Serena com um forno, uma bancada comprida e um fermento que veio de casa, alimentado todo dia desde então.',
      'Aqui a massa descansa o tempo que precisa. O pão de fermentação natural leva 36 horas; o croissant, três dias. Não tem atalho, e dá para sentir na primeira mordida.',
      'O resto é bairro: gente que passa a caminho do trabalho, criança que escolhe o sonho pela vitrine, vizinho que encomenda o bolo de todo aniversário.',
    ],
    numeros: [
      { valor: '36 h', rotulo: 'de fermentação no pão da casa' },
      { valor: '5h', rotulo: 'é quando o forno acende' },
      { valor: '22', rotulo: 'receitas no cardápio' },
    ],
  },

  ondeEstamos: {
    intervalo: (abre: string, fecha: string) => `${abre} às ${fecha}`,
    kicker: 'Onde estamos',
    titulo: 'Passa aqui, o café está passado',
    destaque: 'passado',
    endereco: 'Endereço',
    horarios: 'Horários',
    hoje: 'hoje',
    comoChegar: 'Como chegar',
    comoChegarDetalhe: 'abre o mapa em outra aba',
    telefone: 'Telefone',
    fechado: 'Fechado',
  },

  rodape: {
    frase: 'Pão de fermentação natural, folhados e bolos por encomenda, na Vila Serena.',
    navegacao: 'Navegação',
    contato: 'Contato',
    horarios: 'Horários',
    aviso: 'Projeto fictício de portfólio — negócio, depoimentos e números ilustrativos; fotos geradas por IA.',
    direitos: 'Fornada Padaria',
  },

  whatsapp: {
    falarComPadaria: 'Falar com a padaria',
    mensagemDuvida: 'Olá, Fornada! Tenho uma dúvida.',
  },

  sacola: {
    titulo: 'Sua sacola',
    abrir: 'Abrir sacola',
    adicionar: 'Adicionar',
    adicionarAria: (nome: string) => `Adicionar ${nome} à sacola`,
    diminuirAria: (nome: string) => `Diminuir ${nome}`,
    aumentarAria: (nome: string) => `Aumentar ${nome}`,
    quantidadeAria: (nome: string) => `Quantidade de ${nome}`,
    escolhaTamanho: 'Escolha um tamanho',
    tamanho: 'Tamanho',
    aPartirDe: 'a partir de',
    desfazer: 'Desfazer',
    desfazerAria: (nome: string) => `Desfazer a remoção de ${nome}`,
    fecharAviso: 'Fechar aviso',
    unidades: (n: number) => (n === 1 ? '1 unidade' : `${n} unidades`),
    itens: (n: number) => (n === 1 ? '1 item' : `${n} itens`),
    avisoAdicionado: (nome: string, resumo: string) => `Adicionado: ${nome}. Sacola com ${resumo}.`,
    avisoQuantidade: (nome: string, qtd: string, resumo: string) => `${nome}: ${qtd}. Sacola com ${resumo}.`,
    avisoRemovido: (nome: string) => `Removido da sacola: ${nome}.`,
    avisoDevolvido: (nome: string) => `${nome} voltou para a sacola.`,
    avisoLimite: 'Até 20 unidades por item. Para mais, fale com a gente no WhatsApp.',
    avisoVazia: 'Sacola esvaziada.',
  },
} as const
