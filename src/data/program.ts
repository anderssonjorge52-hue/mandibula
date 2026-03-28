import { 
  Wind, 
  Hand, 
  Thermometer, 
  Maximize, 
  Smile, 
  Eye, 
  MoveHorizontal, 
  RotateCw, 
  ShieldCheck, 
  Zap,
  Moon,
  Sun,
  Target,
  Activity
} from 'lucide-react';

export interface Exercise {
  id: string;
  name: string;
  objective: string;
  instructions: string[];
  duration: string;
  icon: any;
}

export interface Day {
  id: number;
  title: string;
  objective: string;
  exercises: Exercise[];
}

export const PROGRAM_DATA: Day[] = [
  {
    id: 1,
    title: "Alívio Inicial da Tensão",
    objective: "Reduzir a carga muscular imediata e preparar a região.",
    exercises: [
      {
        id: "d1-e1",
        name: "Respiração de Alívio",
        objective: "Reduzir a tensão sistêmica do corpo.",
        instructions: [
          "Sente-se confortavelmente com as costas eretas.",
          "Inspire pelo nariz por 4 segundos, sentindo o abdômen expandir.",
          "Expire lentamente pela boca por 6 segundos.",
          "Repita o ciclo focando em soltar os ombros."
        ],
        duration: "2 min",
        icon: Wind
      },
      {
        id: "d1-e2",
        name: "Massagem Circular no Masseter",
        objective: "Soltar o músculo principal da mastigação.",
        instructions: [
          "Localize o músculo lateral da mandíbula (abaixo das maçãs do rosto).",
          "Use as pontas dos dedos para fazer movimentos circulares suaves.",
          "Mantenha a boca levemente aberta durante o processo.",
          "Não aplique força excessiva, apenas pressão confortável."
        ],
        duration: "1 min",
        icon: Hand
      },
      {
        id: "d1-e3",
        name: "Compressa de Calma",
        objective: "Aumentar o fluxo sanguíneo e relaxar fibras musculares.",
        instructions: [
          "Use uma toalha morna (não quente) nas laterais do rosto.",
          "Feche os olhos e sinta o calor penetrando nos músculos.",
          "Mantenha por 1 minuto respirando calmamente.",
          "Sinta a mandíbula 'derreter' com o calor."
        ],
        duration: "1 min",
        icon: Thermometer
      },
      {
        id: "d1-e4",
        name: "Abertura em 'N'",
        objective: "Melhorar a mobilidade sem forçar a articulação.",
        instructions: [
          "Coloque a ponta da língua no céu da boca, logo atrás dos dentes superiores.",
          "Abra a boca lentamente o máximo que conseguir sem tirar a língua do lugar.",
          "Feche devagar.",
          "Repita o movimento de forma fluida."
        ],
        duration: "1 min",
        icon: Maximize
      },
      {
        id: "d1-e5",
        name: "Posição de Repouso",
        objective: "Ensinar a mandíbula a ficar relaxada.",
        instructions: [
          "Dentes superiores e inferiores não devem se encostar.",
          "Língua relaxada no céu da boca.",
          "Lábios suavemente selados.",
          "Mantenha essa consciência por 1 minuto."
        ],
        duration: "1 min",
        icon: Smile
      }
    ]
  },
  {
    id: 2,
    title: "Consciência da Mandíbula",
    objective: "Identificar hábitos de tensão e melhorar a percepção corporal.",
    exercises: [
      {
        id: "d2-e1",
        name: "Escaneamento Facial",
        objective: "Localizar pontos de dor ou rigidez.",
        instructions: [
          "Feche os olhos e percorra mentalmente seu rosto.",
          "Note se há tensão na testa, olhos ou mandíbula.",
          "Ao expirar, imagine esses pontos relaxando.",
          "Repita 5 vezes."
        ],
        duration: "1 min",
        icon: Eye
      },
      {
        id: "d2-e2",
        name: "Deslizamento Lateral Suave",
        objective: "Testar a simetria do movimento.",
        instructions: [
          "Abra a boca levemente (espaço de um dedo).",
          "Mova a mandíbula para a direita bem devagar.",
          "Volte ao centro e mova para a esquerda.",
          "Sinta se um lado é mais rígido que o outro."
        ],
        duration: "1 min",
        icon: MoveHorizontal
      },
      {
        id: "d2-e3",
        name: "O 'Ah' Silencioso",
        objective: "Relaxar a base da língua e garganta.",
        instructions: [
          "Imagine que vai bocejar, mas mantenha os lábios fechados.",
          "Sinta o espaço crescendo dentro da boca.",
          "A garganta deve se sentir aberta e relaxada.",
          "Mantenha por 10 segundos e relaxe."
        ],
        duration: "1 min",
        icon: Wind
      },
      {
        id: "d2-e4",
        name: "Toque de Pluma",
        objective: "Evitar o apertamento dentário.",
        instructions: [
          "Encoste os dentes bem de leve.",
          "Afaste-os imediatamente 2 milímetros.",
          "Sinta a diferença entre 'tensão' e 'repouso'.",
          "Repita para fixar a sensação de relaxamento."
        ],
        duration: "1 min",
        icon: Smile
      },
      {
        id: "d2-e5",
        name: "Pêndulo de Cabeça",
        objective: "Aliviar a tensão cervical que afeta a DTM.",
        instructions: [
          "Deixe o queixo cair suavemente em direção ao peito.",
          "Faça movimentos de meia-lua com a cabeça (ombro a ombro).",
          "Mantenha a mandíbula solta durante o movimento.",
          "Sinta o peso da cabeça alongando o pescoço."
        ],
        duration: "1 min",
        icon: RotateCw
      }
    ]
  },
  {
    id: 3,
    title: "Redução de Estalos",
    objective: "Suavizar o movimento articular e reduzir ruídos.",
    exercises: [
      {
        id: "d3-e1",
        name: "Língua de Apoio",
        objective: "Estabilizar a mandíbula durante a abertura.",
        instructions: [
          "Mantenha a língua no céu da boca.",
          "Abra a boca apenas até o ponto antes de ouvir o estalo.",
          "Mantenha por 3 segundos e feche.",
          "O objetivo é treinar o movimento sem o ruído."
        ],
        duration: "1 min",
        icon: ShieldCheck
      },
      {
        id: "d3-e2",
        name: "Resistência Suave (Abertura)",
        objective: "Fortalecer músculos depressores de forma controlada.",
        instructions: [
          "Coloque dois dedos abaixo do queixo.",
          "Tente abrir a boca enquanto os dedos fazem uma leve pressão contrária.",
          "Não force, a resistência deve ser mínima.",
          "Repita 5 vezes lentamente."
        ],
        duration: "1 min",
        icon: Target
      },
      {
        id: "d3-e3",
        name: "Massagem Temporal",
        objective: "Relaxar o músculo temporal (acima das orelhas).",
        instructions: [
          "Use as pontas dos dedos nas têmporas.",
          "Faça movimentos circulares lentos.",
          "Sinta como esse relaxamento reflete na mandíbula.",
          "Respire profundamente durante a massagem."
        ],
        duration: "1 min",
        icon: Hand
      },
      {
        id: "d3-e4",
        name: "O Sorriso Largo",
        objective: "Alongar a musculatura perioral.",
        instructions: [
          "Faça um sorriso bem largo sem mostrar os dentes.",
          "Sinta o alongamento nas bochechas.",
          "Mantenha por 5 segundos e relaxe.",
          "Repita 5 vezes."
        ],
        duration: "1 min",
        icon: Smile
      },
      {
        id: "d3-e5",
        name: "Foco no Centro",
        objective: "Alinhamento da mordida.",
        instructions: [
          "Olhe-se no espelho.",
          "Abra e feche a boca tentando manter o queixo centralizado.",
          "Observe se ele desvia para algum lado.",
          "Tente corrigir o caminho de forma bem lenta."
        ],
        duration: "1 min",
        icon: Eye
      }
    ]
  },
  {
    id: 4,
    title: "Relaxamento Profundo",
    objective: "Atingir camadas mais profundas de relaxamento muscular.",
    exercises: [
      {
        id: "d4-e1",
        name: "Calor e Silêncio",
        objective: "Desligar estímulos externos.",
        instructions: [
          "Aqueça as mãos esfregando uma na outra.",
          "Coloque as palmas sobre as articulações da mandíbula.",
          "Feche os olhos e permaneça em silêncio.",
          "Sinta a pulsação e o relaxamento."
        ],
        duration: "2 min",
        icon: Thermometer
      },
      {
        id: "d4-e2",
        name: "Liberação de Pescoço",
        objective: "Soltar a base do crânio.",
        instructions: [
          "Entrelace as mãos atrás da nuca.",
          "Deixe o peso dos braços alongar suavemente o pescoço para frente.",
          "Mantenha a boca entreaberta.",
          "Sinta a conexão entre pescoço e mandíbula."
        ],
        duration: "1 min",
        icon: RotateCw
      },
      {
        id: "d4-e3",
        name: "O Peixe Relaxado",
        objective: "Soltar as bochechas por dentro.",
        instructions: [
          "Encha as bochechas de ar suavemente.",
          "Mova o ar de um lado para o outro.",
          "Solte o ar pela boca como um suspiro.",
          "Repita 3 vezes."
        ],
        duration: "1 min",
        icon: Wind
      },
      {
        id: "d4-e4",
        name: "Massagem na Nuca",
        objective: "Aliviar pontos de gatilho cervicais.",
        instructions: [
          "Use os polegares na base do crânio.",
          "Pressione levemente e faça pequenos círculos.",
          "Solte o ar enquanto pressiona.",
          "Sinta a tensão saindo da cabeça."
        ],
        duration: "1 min",
        icon: Hand
      },
      {
        id: "d4-e5",
        name: "Visualização de Leveza",
        objective: "Relaxamento mental focado.",
        instructions: [
          "Imagine que sua mandíbula é feita de algodão.",
          "Ela flutua, sem peso, sem esforço.",
          "Sinta cada dente se afastando um do outro.",
          "Mantenha essa imagem por 1 minuto."
        ],
        duration: "1 min",
        icon: Moon
      }
    ]
  },
  {
    id: 5,
    title: "Controle no Dia a Dia",
    objective: "Integrar o relaxamento nas atividades rotineiras.",
    exercises: [
      {
        id: "d5-e1",
        name: "Check-up de Tensão",
        objective: "Criar gatilhos de consciência.",
        instructions: [
          "Sempre que olhar para o celular, verifique sua mandíbula.",
          "Se estiver apertando, solte imediatamente.",
          "Língua no céu da boca.",
          "Repita esse hábito agora."
        ],
        duration: "1 min",
        icon: Activity
      },
      {
        id: "d5-e2",
        name: "Postura de Ombro",
        objective: "Melhorar a base de suporte da cabeça.",
        instructions: [
          "Gire os ombros para trás e para baixo.",
          "Imagine um fio puxando o topo da sua cabeça para cima.",
          "Isso tira a pressão da mandíbula.",
          "Mantenha a postura respirando fundo."
        ],
        duration: "1 min",
        icon: ShieldCheck
      },
      {
        id: "d5-e3",
        name: "Soltura de Trapézio",
        objective: "Reduzir a tensão que sobe para o rosto.",
        instructions: [
          "Incline a cabeça para o lado (orelha no ombro).",
          "Use a mão do mesmo lado para dar um peso extra suave.",
          "Mantenha por 30 segundos cada lado.",
          "Mandíbula sempre solta."
        ],
        duration: "1 min",
        icon: RotateCw
      },
      {
        id: "d5-e4",
        name: "O Bocejo Controlado",
        objective: "Alongamento máximo seguro.",
        instructions: [
          "Inicie um bocejo.",
          "Coloque a mão sob o queixo para limitar a abertura.",
          "Não deixe a boca abrir até o limite total.",
          "Sinta o alongamento sem o impacto final."
        ],
        duration: "1 min",
        icon: Maximize
      },
      {
        id: "d5-e5",
        name: "Hidratação Consciente",
        objective: "Manter tecidos lubrificados.",
        instructions: [
          "Beba um copo de água lentamente.",
          "Sinta o movimento de deglutição relaxado.",
          "Não tensione o rosto ao engolir.",
          "Foco na suavidade do movimento."
        ],
        duration: "1 min",
        icon: Zap
      }
    ]
  },
  {
    id: 6,
    title: "Estabilidade da Mandíbula",
    objective: "Fortalecer a musculatura de suporte sem gerar tensão.",
    exercises: [
      {
        id: "d6-e1",
        name: "Resistência Lateral",
        objective: "Equilibrar a força dos músculos laterais.",
        instructions: [
          "Coloque a mão na lateral do queixo.",
          "Tente mover a mandíbula contra a mão.",
          "A força deve ser de apenas 10% da sua capacidade.",
          "Mantenha 5 segundos e troque o lado."
        ],
        duration: "1 min",
        icon: Target
      },
      {
        id: "d6-e2",
        name: "Apoio de Punho",
        objective: "Estabilizar o fechamento.",
        instructions: [
          "Coloque o punho fechado sob o queixo.",
          "Tente fechar a boca contra a resistência do punho.",
          "Mantenha a língua no céu da boca.",
          "Repita 5 vezes suavemente."
        ],
        duration: "1 min",
        icon: ShieldCheck
      },
      {
        id: "d6-e3",
        name: "Massagem Intraoral (Opcional)",
        objective: "Soltar o músculo por dentro da boca.",
        instructions: [
          "Com as mãos limpas, coloque o polegar dentro da bochecha.",
          "Pinçe o músculo masseter entre o polegar e os dedos externos.",
          "Massageie suavemente de cima para baixo.",
          "Sinta a liberação profunda."
        ],
        duration: "1 min",
        icon: Hand
      },
      {
        id: "d6-e4",
        name: "O 'X' e 'O'",
        objective: "Mobilidade labial e facial.",
        instructions: [
          "Exagere o movimento ao dizer 'X' (sorriso largo).",
          "Exagere o movimento ao dizer 'O' (boca de bueiro).",
          "Faça sem pressa, sentindo os músculos trabalharem.",
          "Repita 10 vezes."
        ],
        duration: "1 min",
        icon: RotateCw
      },
      {
        id: "d6-e5",
        name: "Relaxamento de Olhar",
        objective: "Reduzir a tensão ocular que trava a mandíbula.",
        instructions: [
          "Olhe para longe, no horizonte.",
          "Deixe o foco ficar 'suave' ou 'borrado'.",
          "Sinta como seus dentes se afastam naturalmente.",
          "Respire e mantenha a calma."
        ],
        duration: "1 min",
        icon: Eye
      }
    ]
  },
  {
    id: 7,
    title: "Manutenção e Prevenção",
    objective: "Consolidar o aprendizado e criar um plano para o futuro.",
    exercises: [
      {
        id: "d7-e1",
        name: "Circuito de Alívio",
        objective: "Revisar os melhores exercícios.",
        instructions: [
          "Escolha os 3 exercícios que mais te ajudaram.",
          "Execute cada um por 30 segundos.",
          "Sinta a evolução desde o primeiro dia.",
          "Sua mandíbula está mais leve."
        ],
        duration: "2 min",
        icon: Activity
      },
      {
        id: "d7-e2",
        name: "Postura de Sono e ATM",
        objective: "Evitar a compressão da mandíbula durante a noite.",
        instructions: [
          "Dormir de barriga para cima é a posição mais neutra para a ATM.",
          "Se dormir de lado, use um travesseiro alto o suficiente para manter o pescoço reto.",
          "Coloque um travesseiro entre os joelhos para evitar a rotação da coluna.",
          "NUNCA durma de bruços: isso força a mandíbula para o lado por horas.",
          "Antes de apagar a luz, verifique se há espaço entre os dentes.",
          "Se sentir tensão, coloque a ponta da língua no céu da boca."
        ],
        duration: "2 min",
        icon: Moon
      },
      {
        id: "d7-e3",
        name: "Relaxamento Pré-Sono",
        objective: "Desprogramar a tensão muscular antes de dormir.",
        instructions: [
          "Sente-se na beira da cama com os pés no chão.",
          "Faça movimentos circulares suaves com os ombros (5x para trás).",
          "Abra a boca suavemente e balance a mandíbula de um lado para o outro.",
          "Massageie as têmporas com movimentos circulares leves.",
          "Respire pelo nariz, sentindo o abdômen expandir, por 10 ciclos.",
          "Deite-se mantendo a sensação de peso e relaxamento."
        ],
        duration: "3 min",
        icon: Bed
      },
      {
        id: "d7-e4",
        name: "Alinhamento de Coluna",
        objective: "Corrigir a postura global que afeta a mandíbula.",
        instructions: [
          "Encoste as costas em uma parede (calcanhares, glúteos e ombros).",
          "Tente encostar a nuca na parede sem levantar o queixo.",
          "Mantenha a mandíbula relaxada e os ombros para baixo.",
          "Respire profundamente mantendo o alinhamento por 1 minuto."
        ],
        duration: "1 min",
        icon: Target
      },
      {
        id: "d7-e5",
        name: "Abertura de Ombros",
        objective: "Reduzir a tensão peitoral que puxa a cabeça para frente.",
        instructions: [
          "Entrelace as mãos atrás das costas.",
          "Estique os braços e abra o peito, olhando levemente para cima.",
          "Não force o pescoço, foque na abertura dos ombros.",
          "Mantenha por 30 segundos, relaxe e repita."
        ],
        duration: "1 min",
        icon: Maximize
      },
      {
        id: "d7-e6",
        name: "Descompressão Cervical",
        objective: "Aliviar a base do crânio e pescoço.",
        instructions: [
          "Deitado, coloque uma toalha enrolada sob a nuca (não sob a cabeça).",
          "Deixe o peso da cabeça tracionar suavemente o pescoço.",
          "Mantenha a boca entreaberta e a língua relaxada.",
          "Sinta o alongamento passivo por 2 minutos.",
          "Isso ajuda a alinhar a coluna cervical com a ATM."
        ],
        duration: "2 min",
        icon: Wind
      },
      {
        id: "d7-e7",
        name: "Lembrete de Repouso",
        objective: "Fixar a posição correta.",
        instructions: [
          "Dentes separados, lábios juntos, língua no céu da boca.",
          "Este é o seu novo normal.",
          "Sinta o conforto dessa posição.",
          "Respire e relaxe."
        ],
        duration: "1 min",
        icon: ShieldCheck
      },
      {
        id: "d7-e8",
        name: "O Sorriso Interno",
        objective: "Manter o estado de relaxamento mental.",
        instructions: [
          "Imagine um sorriso começando nos seus olhos.",
          "Deixe ele descer para as bochechas e mandíbula.",
          "Sinta a gratidão pelo progresso feito.",
          "Mantenha essa sensação."
        ],
        duration: "1 min",
        icon: Smile
      },
      {
        id: "d7-e9",
        name: "Compromisso com Você",
        objective: "Manter os resultados.",
        instructions: [
          "Prometa a si mesmo fazer pelo menos 1 exercício por dia.",
          "A consistência é a chave para o alívio duradouro.",
          "Parabéns por completar os 7 dias!",
          "Sua saúde agradece."
        ],
        duration: "1 min",
        icon: Sun
      }
    ]
  }
];
