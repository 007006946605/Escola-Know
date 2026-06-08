# Relatorio de Revisao Tecnica - Colegio Tecnico KNOW

## Estrutura Geral do Projeto

O projeto e uma aplicacao web estatica organizada em duas paginas principais:

- `index.html`: pagina publica institucional. Apresenta a escola, os cursos, a matriz curricular, FAQ, KNOW Hub, quiz vocacional, raspadinha de evento e formulario de captacao.
- `secretaria.html`: painel dedicado da Secretaria. Reune metricas, funil, cursos, pipeline e tabela de leads para demonstrar como os cadastros podem virar uma rotina administrativa.

A separacao por pastas e direta:

- `assets/`: identidade visual, logos e imagens de preview.
- `css/`: estilos separados por responsabilidade visual.
- `js/`: controladores JavaScript separados por funcionalidade.
- `docs/`: materiais de apoio para apresentacao e avaliacao tecnica.

### Principais Modulos e Responsabilidades

`js/app.js`

Responsavel por inicializar a experiencia publica. Ele centraliza tema, navegacao, animacoes, FAQ, KNOW Hub, widgets e captura de leads. Funciona como o orquestrador da pagina principal.

`js/quiz.js`

Responsavel pelo quiz vocacional. Mantem o banco de perguntas, controla progresso, pontuacao por perfil e resultado final. Tambem salva o resultado no armazenamento local.

`js/scratchcard.js`

Responsavel pela raspadinha promocional. Controla o sorteio de premio, a camada de canvas raspavel, o cooldown diario e o premio associado ao lead.

`js/leads.js`

Responsavel pelo formulario de captacao. Valida campos, salva leads em `localStorage` e mostra a tela de sucesso apos o envio.

`js/secretaria-dashboard.js`

Responsavel pelo painel dedicado da Secretaria. Le leads reais, combina dados demonstrativos quando necessario e renderiza quatro areas: visao geral, cursos, pipeline e leads.

### Fluxo Geral de Funcionamento

1. O usuario acessa `index.html`.
2. O script `app.js` inicializa navegacao, tema, animacoes e widgets.
3. No KNOW Hub, o usuario pode responder ao quiz ou usar a raspadinha.
4. O resultado do quiz e o premio da raspadinha podem influenciar a jornada ate o formulario.
5. O formulario salva o lead em `localStorage` pela chave `know_leads`.
6. A Secretaria acessa `secretaria.html`.
7. O dashboard le os leads reais e permite alternar entre `Real`, `Mock` e `Real + mock`.
8. O painel exibe metricas, cursos, pipeline e detalhe de leads.

## Melhorias Aplicadas

### Nomenclatura mais clara no dashboard da Secretaria

Foram substituidos nomes internos genericos por nomes mais descritivos em `js/secretaria-dashboard.js`.

Exemplos:

- `STORAGE_KEY` virou `LEADS_STORAGE_KEY`.
- `COURSE_META` virou `COURSE_PRESENTATION`.
- `STATUS_META` virou `LEAD_STATUS_PRESENTATION`.
- `DASH_ICONS` virou `INLINE_SVG_ICONS`.
- `mockLeads` virou `DEMO_LEADS`.
- `rows` virou `activeLeads`.
- `selectedId` virou `selectedLeadId`.
- `currentSource` virou `activeDataSource`.
- `resolveRows()` virou `resolveVisibleLeads()`.

Esses nomes reduzem a necessidade de contexto mental. Um avaliador consegue entender mais rapidamente que os dados exibidos no dashboard sao leads ativos, que existem leads demonstrativos e que a fonte atual pode ser alternada.

### Comentario arquitetural pontual

Foi adicionado um comentario no topo de `js/secretaria-dashboard.js` explicando a decisao de produto por tras dos modos de dados:

- `Real`: somente leads do formulario.
- `Mock`: cenario demonstrativo.
- `Real + mock`: combinacao para apresentacao quando a base real ainda e pequena.

Esse comentario agrega valor porque explica uma regra de negocio que nao e obvia apenas lendo as funcoes.

### README reestruturado

O `README.md` foi reescrito com foco em apresentacao:

- objetivo do projeto;
- paginas principais;
- responsabilidades dos modulos JavaScript;
- responsabilidades dos arquivos CSS;
- fonte de dados;
- instrucoes de abertura;
- estrutura de pastas;
- paleta principal;
- observacao tecnica sobre a escolha de HTML, CSS e JavaScript puro.

Essa organizacao facilita a leitura por professores, recrutadores e outros desenvolvedores.

### Relatorio tecnico dedicado

Foi criado este documento em `docs/relatorio-revisao-tech-lead.md`, separando a explicacao tecnica do README. O README fica como guia rapido; o relatorio serve como material de apresentacao e defesa tecnica.

## Pontos que Ainda Merecem Atencao

### Dividir `secretaria-dashboard.js`

O arquivo ainda concentra varias responsabilidades:

- dados demonstrativos;
- normalizacao de leads;
- renderizacao da visao geral;
- renderizacao de cursos;
- renderizacao do pipeline;
- renderizacao da tabela e detalhe de leads;
- eventos de navegacao e filtros.

Para uma proxima etapa, seria melhor separar em arquivos como:

- `secretaria-data.js`
- `secretaria-overview.js`
- `secretaria-courses.js`
- `secretaria-pipeline.js`
- `secretaria-leads.js`
- `secretaria-dom-utils.js`

Essa divisao aumentaria a manutencao e deixaria cada arquivo com uma responsabilidade mais clara.

### Separar dados mock de codigo de UI

Os dados demonstrativos de cursos, pipeline e leads ainda ficam dentro do mesmo arquivo que renderiza a interface. Para um projeto maior, esses dados deveriam ir para um arquivo proprio, por exemplo `js/data/secretaria-demo-data.js`.

### Padronizar acentuacao e codificacao

O projeto usa bastante texto em portugues. E importante garantir que todos os arquivos estejam salvos em UTF-8 e que os textos aparecam corretamente em todos os ambientes. Em contexto academico, isso evita que caracteres acentuados sejam exibidos como texto quebrado.

### Reduzir HTML gerado por template string

Os modulos JavaScript renderizam bastante HTML por template string. Isso funciona em um projeto estatico, mas pode dificultar manutencao quando a interface cresce. Uma evolucao possivel seria criar helpers de componentes ou migrar para uma estrutura com framework leve.

### Criar testes manuais documentados

O projeto ainda se beneficia de um roteiro de validacao para apresentacao:

- responder quiz;
- revelar raspadinha;
- enviar lead;
- abrir secretaria;
- alternar fontes de dados;
- clicar em curso;
- clicar em lead;
- navegar pelo pipeline.

Esse roteiro ajudaria qualquer avaliador a validar o fluxo sem depender de explicacao oral.

## Uso de IA como Ferramenta de Co-criacao

### Refinamento visual do Hero e da Identidade

Problema ou desafio:

Criar um hero com identidade visual propria, mantendo o simbolo da marca e adicionando interacoes sem deixar a interface exagerada.

Como a IA poderia auxiliar:

A IA pode sugerir alternativas de composicao, microinteracoes, animacoes de entrada e ajustes de hover com base em referencias visuais.

Papel humano:

O humano define a direcao visual, aponta problemas percebidos, rejeita excessos e decide o que combina com a identidade do colegio.

Por que e co-criacao:

O resultado nasce de iteracoes: a IA propoe e implementa possibilidades, enquanto o humano avalia, corrige, prioriza e direciona o nivel de sofisticao.

### KNOW Hub com Quiz, Raspadinha e Captacao

Problema ou desafio:

Transformar uma landing page comum em uma experiencia interativa capaz de capturar interesse de forma mais envolvente.

Como a IA poderia auxiliar:

A IA pode ajudar a estruturar perguntas do quiz, estados da raspadinha, fluxo de formulario e mensagens de transicao.

Papel humano:

O humano decide quais experiencias fazem sentido para o contexto escolar e ajusta o nivel de complexidade para caber no projeto.

Por que e co-criacao:

A IA acelera a prototipacao de interacoes, mas a intencao pedagogica e a decisao sobre o fluxo final dependem de julgamento humano.

### Painel da Secretaria

Problema ou desafio:

Criar uma tela administrativa compreensivel mesmo com poucos dados reais, mantendo valor demonstrativo para apresentacao.

Como a IA poderia auxiliar:

A IA pode propor dashboards, organizar KPIs, simular dados, sugerir funis e construir a interface operacional.

Papel humano:

O humano valida o que parece util para uma secretaria real, pede novas abas, remove acoes desnecessarias e ajusta o comportamento esperado.

Por que e co-criacao:

O modo `Real + mock` e uma decisao de apresentacao: dados reais sao preservados, mas dados demonstrativos completam o painel. A IA apoia a implementacao, enquanto o humano define a necessidade comunicacional.

### Refatoracao e Clareza para Apresentacao

Problema ou desafio:

Um projeto visualmente rico pode ficar dificil de explicar se nomes, arquivos e responsabilidades nao forem claros.

Como a IA poderia auxiliar:

A IA pode atuar como revisora tecnica, identificar nomes ambiguos, sugerir organizacao e gerar documentacao de apoio.

Papel humano:

O humano define o publico da apresentacao, o nivel de detalhe esperado e quais compromissos sao aceitaveis entre refatorar tudo ou preservar estabilidade.

Por que e co-criacao:

A IA nao substitui a avaliacao tecnica. Ela ajuda a tornar explicitas as decisoes, mas o humano continua responsavel por escopo, criterios de qualidade e narrativa final.

## Parecer de Tech Lead

O projeto comunica bem a proposta de um colegio tecnico moderno e tem uma jornada completa, do visitante ao painel administrativo. Para apresentacao, os pontos mais fortes sao:

- fluxo completo de captacao;
- experiencias interativas no Hub;
- dashboard dedicado da Secretaria;
- uso claro de dados reais e mock;
- identidade visual consistente.

O principal risco tecnico e a concentracao de responsabilidades nos arquivos maiores, especialmente `secretaria-dashboard.js` e `secretaria.css`. Isso nao impede a apresentacao, mas deve ser explicado como uma limitacao natural de um prototipo estatico que evoluiu bastante visualmente.

A recomendacao e apresentar o projeto como um prototipo funcional de alta fidelidade, destacando que a proxima etapa tecnica seria modularizar o dashboard e transformar os dados demonstrativos em uma camada separada.
