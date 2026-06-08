# Relatório de Revisão Técnica - Colégio Técnico KNOW

## Estrutura Geral do Projeto

O projeto é uma aplicação web estática organizada em duas páginas principais:

- `index.html`: página pública institucional. Apresenta a escola, os cursos, a matriz curricular, o FAQ, o KNOW Hub, o quiz vocacional, a raspadinha de eventos e o formulário de captação.
- `secretaria.html`: painel dedicado da Secretaria. Reúne métricas, cursos, pipeline e tabela de leads para demonstrar como os cadastros podem virar uma rotina administrativa.

A separação por pastas é direta:

- `assets/`: identidade visual, logos e imagens de preview.
- `css/`: estilos separados por responsabilidade visual.
- `js/`: controladores JavaScript separados por funcionalidade.
- `docs/`: materiais de apoio para apresentação e avaliação técnica.

### Principais Módulos e Responsabilidades

`js/app.js`

Responsável por inicializar a experiência pública. Ele centraliza tema, navegação, animações, FAQ, KNOW Hub, widgets e captura de leads. Funciona como o orquestrador da página principal.

`js/quiz.js`

Responsável pelo quiz vocacional. Mantém o banco de perguntas, controla progresso, pontuação por perfil e resultado final. Também salva o resultado no armazenamento local.

`js/scratchcard.js`

Responsável pela raspadinha promocional. Controla o sorteio de prêmio, a camada de canvas raspável, o cooldown diário e o prêmio associado ao lead.

`js/leads.js`

Responsável pelo formulário de captação. Valida campos, salva leads em `localStorage` e mostra a tela de sucesso após o envio.

`js/secretaria-dashboard.js`

Responsável pelo painel dedicado da Secretaria. Lê leads reais, combina dados demonstrativos quando necessário e renderiza quatro áreas: visão geral, cursos, pipeline e leads.

### Fluxo Geral de Funcionamento

1. O usuário acessa `index.html`.
2. O script `app.js` inicializa navegação, tema, animações e widgets.
3. No KNOW Hub, o usuário pode responder ao quiz ou usar a raspadinha.
4. O resultado do quiz e o prêmio da raspadinha podem influenciar a jornada até o formulário.
5. O formulário salva o lead em `localStorage` pela chave `know_leads`.
6. A Secretaria acessa `secretaria.html`.
7. O dashboard lê os leads reais e permite alternar entre `Real`, `Mock` e `Real + mock`.
8. O painel exibe métricas, cursos, pipeline e detalhes de leads.

## Melhorias Aplicadas

### Dashboard dedicado da Secretaria

O painel administrativo antigo dentro do Hub foi substituído por uma página própria em `secretaria.html`. Essa decisão melhora a apresentação do projeto porque separa a experiência pública do visitante da experiência operacional da Secretaria.

A tela atual possui:

- saudação do usuário logado como `Xiru`;
- navegação lateral com `Visão geral`, `Cursos`, `Pipeline` e `Leads`;
- seletor de fonte de dados (`Real`, `Mock` e `Real + mock`);
- cards de atenção, funil resumido, tabela de leads e painéis laterais de detalhe;
- atalho `Voltar ao Hub` para retornar ao site público.

### Nomenclatura mais clara no dashboard

Foram substituídos nomes internos genéricos por nomes mais descritivos em `js/secretaria-dashboard.js`.

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

Esses nomes reduzem a necessidade de contexto mental. Um avaliador consegue entender mais rapidamente que os dados exibidos no dashboard são leads ativos, que existem leads demonstrativos e que a fonte atual pode ser alternada.

### Comentário arquitetural pontual

Foi adicionado um comentário no topo de `js/secretaria-dashboard.js` explicando a decisão de produto por trás dos modos de dados:

- `Real`: somente leads do formulário.
- `Mock`: cenário demonstrativo.
- `Real + mock`: combinação para apresentação quando a base real ainda é pequena.

Esse comentário agrega valor porque explica uma regra de negócio que não é óbvia apenas lendo as funções.

### README reestruturado

O `README.md` foi reescrito com foco em apresentação:

- objetivo do projeto;
- previews atuais do dashboard;
- páginas principais;
- responsabilidades dos módulos JavaScript;
- responsabilidades dos arquivos CSS;
- fonte de dados;
- instruções de abertura;
- estrutura de pastas;
- paleta principal;
- observação técnica sobre a escolha de HTML, CSS e JavaScript puro.

Essa organização facilita a leitura por professores, recrutadores e outros desenvolvedores.

## Pontos que Ainda Merecem Atenção

### Dividir `secretaria-dashboard.js`

O arquivo ainda concentra várias responsabilidades:

- dados demonstrativos;
- normalização de leads;
- renderização da visão geral;
- renderização de cursos;
- renderização do pipeline;
- renderização da tabela e do detalhe de leads;
- eventos de navegação e filtros.

Para uma próxima etapa, seria melhor separar em arquivos como:

- `secretaria-data.js`
- `secretaria-overview.js`
- `secretaria-courses.js`
- `secretaria-pipeline.js`
- `secretaria-leads.js`
- `secretaria-dom-utils.js`

Essa divisão aumentaria a manutenibilidade e deixaria cada arquivo com uma responsabilidade mais clara.

### Separar dados mock do código de UI

Os dados demonstrativos de cursos, pipeline e leads ainda ficam dentro do mesmo arquivo que renderiza a interface. Para um projeto maior, esses dados deveriam ir para um arquivo próprio, por exemplo `js/data/secretaria-demo-data.js`.

### Reduzir HTML gerado por template string

Os módulos JavaScript renderizam bastante HTML por template string. Isso funciona em um projeto estático, mas pode dificultar a manutenção quando a interface cresce. Uma evolução possível seria criar helpers de componentes ou migrar para uma estrutura com framework leve.

### Criar testes manuais documentados

O projeto ainda se beneficia de um roteiro de validação para apresentação:

- responder ao quiz;
- revelar a raspadinha;
- enviar um lead;
- abrir a Secretaria;
- alternar fontes de dados;
- clicar em um curso;
- clicar em um lead;
- navegar pelo pipeline.

Esse roteiro ajudaria qualquer avaliador a validar o fluxo sem depender de explicação oral.

## Uso de IA como Ferramenta de Cocriação

### Refinamento visual do Hero e da identidade

Problema ou desafio:

Criar um hero com identidade visual própria, mantendo o símbolo da marca e adicionando interações sem deixar a interface exagerada.

Como a IA poderia auxiliar:

A IA pode sugerir alternativas de composição, microinterações, animações de entrada e ajustes de hover com base em referências visuais.

Papel humano:

O humano define a direção visual, aponta problemas percebidos, rejeita excessos e decide o que combina com a identidade do colégio.

Por que é cocriação:

O resultado nasce de iterações: a IA propõe e implementa possibilidades, enquanto o humano avalia, corrige, prioriza e direciona o nível de sofisticação.

### KNOW Hub com quiz, raspadinha e captação

Problema ou desafio:

Transformar uma landing page comum em uma experiência interativa capaz de capturar interesse de forma mais envolvente.

Como a IA poderia auxiliar:

A IA pode ajudar a estruturar perguntas do quiz, estados da raspadinha, fluxo de formulário e mensagens de transição.

Papel humano:

O humano decide quais experiências fazem sentido para o contexto escolar e ajusta o nível de complexidade para caber no projeto.

Por que é cocriação:

A IA acelera a prototipação de interações, mas a intenção pedagógica e a decisão sobre o fluxo final dependem de julgamento humano.

### Painel da Secretaria

Problema ou desafio:

Criar uma tela administrativa compreensível mesmo com poucos dados reais, mantendo valor demonstrativo para apresentação.

Como a IA poderia auxiliar:

A IA pode propor dashboards, organizar KPIs, simular dados, sugerir funis e construir a interface operacional.

Papel humano:

O humano valida o que parece útil para uma secretaria real, pede novas abas, remove ações desnecessárias e ajusta o comportamento esperado.

Por que é cocriação:

O modo `Real + mock` é uma decisão de apresentação: dados reais são preservados, mas dados demonstrativos completam o painel. A IA apoia a implementação, enquanto o humano define a necessidade comunicacional.

### Refatoração e clareza para apresentação

Problema ou desafio:

Um projeto visualmente rico pode ficar difícil de explicar se nomes, arquivos e responsabilidades não forem claros.

Como a IA poderia auxiliar:

A IA pode atuar como revisora técnica, identificar nomes ambíguos, sugerir organização e gerar documentação de apoio.

Papel humano:

O humano define o público da apresentação, o nível de detalhe esperado e quais compromissos são aceitáveis entre refatorar tudo ou preservar estabilidade.

Por que é cocriação:

A IA não substitui a avaliação técnica. Ela ajuda a tornar explícitas as decisões, mas o humano continua responsável por escopo, critérios de qualidade e narrativa final.

## Parecer de Tech Lead

O projeto comunica bem a proposta de um colégio técnico moderno e tem uma jornada completa, do visitante ao painel administrativo. Para apresentação, os pontos mais fortes são:

- fluxo completo de captação;
- experiências interativas no Hub;
- dashboard dedicado da Secretaria;
- uso claro de dados reais e mock;
- identidade visual consistente.

O principal risco técnico é a concentração de responsabilidades nos arquivos maiores, especialmente `secretaria-dashboard.js` e `secretaria.css`. Isso não impede a apresentação, mas deve ser explicado como uma limitação natural de um protótipo estático que evoluiu bastante visualmente.

A recomendação é apresentar o projeto como um protótipo funcional de alta fidelidade, destacando que a próxima etapa técnica seria modularizar o dashboard e transformar os dados demonstrativos em uma camada separada.
