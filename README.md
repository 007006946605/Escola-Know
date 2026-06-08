# Colegio Tecnico KNOW

Projeto academico de site institucional para uma escola tecnica ficticia. A aplicacao combina apresentacao comercial, experiencias interativas de captacao e um painel administrativo da Secretaria para leitura dos leads gerados.

## Preview

### Secretaria - Visao Geral

![Preview da Secretaria - Visao Geral](assets/previews/secretaria-01-overview.png)

### Secretaria - Pipeline

![Preview da Secretaria - Pipeline](assets/previews/secretaria-02-pipeline.png)

### Secretaria - Leads

![Preview da Secretaria - Leads](assets/previews/secretaria-03-leads.png)

## Objetivo do Projeto

O projeto demonstra um fluxo completo de captacao educacional:

1. O visitante conhece a escola, os cursos e as perguntas frequentes.
2. O visitante usa ferramentas do KNOW Hub, como quiz vocacional e raspadinha.
3. O visitante envia interesse pelo formulario de matricula.
4. A Secretaria visualiza esses leads em um painel proprio com metricas, cursos, pipeline e detalhe operacional.

## Paginas Principais

- `index.html`: site principal, com landing page, cursos, FAQ, KNOW Hub e formulario.
- `secretaria.html`: dashboard da Secretaria, separado do site publico para facilitar apresentacao do fluxo administrativo.

## Modulos JavaScript

- `js/app.js`: inicializa a aplicacao publica, navegacao, tema, animacoes, FAQ, KNOW Hub e widgets.
- `js/quiz.js`: controla o quiz vocacional, pontuacao por perfil e recomendacao final.
- `js/scratchcard.js`: controla a raspadinha, cooldown diario e premio associado ao lead.
- `js/leads.js`: valida e salva leads no `localStorage` para uso posterior no dashboard da Secretaria.
- `js/secretaria-dashboard.js`: controla o dashboard dedicado da Secretaria, incluindo visao geral, cursos, pipeline e leads.

## Estilos CSS

- `css/variables.css`: tokens de cor, fonte, sombras e temas.
- `css/base.css`: reset visual, tipografia base e componentes globais.
- `css/layout.css`: estrutura da landing page.
- `css/courses.css`: secoes e cards relacionados aos cursos no site publico.
- `css/widgets.css`: KNOW Hub, quiz, raspadinha e formulario.
- `css/secretaria.css`: dashboard dedicado da Secretaria.

## Fonte de Dados

Os leads reais sao salvos em `localStorage` usando a chave:

```text
know_leads
```

O dashboard da Secretaria possui tres modos:

- `Real`: usa somente leads cadastrados pelo formulario.
- `Mock`: usa uma base demonstrativa para apresentacao.
- `Real + mock`: combina dados reais e demonstrativos para manter graficos legiveis quando ha poucos cadastros reais.

## Como Abrir

Nao ha build, framework ou servidor obrigatorio.

Abra diretamente:

```text
index.html
```

Para acessar o painel da Secretaria:

```text
secretaria.html
```

Tambem e possivel navegar para a Secretaria pelo modulo do Hub no site principal.

## Estrutura de Pastas

```text
.
|-- index.html
|-- secretaria.html
|-- README.md
|-- docs/
|   `-- relatorio-revisao-tech-lead.md
|-- assets/
|   |-- logo-icon.svg
|   |-- logo.svg
|   `-- previews/
|-- css/
|   |-- variables.css
|   |-- base.css
|   |-- layout.css
|   |-- courses.css
|   |-- widgets.css
|   `-- secretaria.css
`-- js/
    |-- app.js
    |-- quiz.js
    |-- scratchcard.js
    |-- leads.js
    `-- secretaria-dashboard.js
```

## Paleta Principal

- Fundo principal: `#0a0f0d`
- Fundo secundario: `#111a16`
- Verde profundo: `#146E51`
- Verde mint: `#55CB96`
- Texto principal: `#f0f4f2`
- Texto secundario: `#a3b3ac`
- Informatica: `#00b4d8`
- Enfermagem: `#ff4d6d`
- Administracao: `#ffb703`

## Observacao para Apresentacao

Este projeto foi construindo como um prototipo de alta fidelidade em HTML, CSS e JavaScript puro. A decisao evita dependencia de build e facilita demonstracao em contexto academico, mas tambem significa que modulos grandes, como `secretaria-dashboard.js`, podem ser futuramente divididos em arquivos menores caso o projeto evolua.
