---
title: "ADR-011: Ecossistema de organizações e compartilhamento de dados"
sidebar_position: 11
tags: [adr, multiempresa, compartilhamento, ecossistema, rls, v2]
---

# ADR-011: Ecossistema de organizações e compartilhamento de dados

**Status:** Aprovado com ajustes (26/09/2026): o Truck atende também clientes isolados; lançamento único

## Contexto

O Truck atende tanto empresas isoladas (uma transportadora que usa o sistema só para a própria oficina) quanto ecossistemas de partes com donos e interesses diferentes:

| Parte | Exemplo | Papel |
| --- | --- | --- |
| Transportadora com manutenção própria | JSL | Dona da frota e da oficina |
| Embarcador com oficina própria (outro CNPJ) | Suzano | Dono de parte da frota, com oficina própria |
| Transportadoras terceiras | Parceiras da Suzano | Donas das próprias frotas |
| Oficina terceirizada | Vale das Carretas | Faz a manutenção das terceiras; a gestão é dela |
| Socorro terceirizado | — | Atende quebras para qualquer uma das partes |

O acesso de uma parte aos dados da outra varia: completo, parcial ou nenhum. Uma oficina que se sinta vigiada tende a boicotar o registro, e dado ruim é pior que nenhum.

O v1 trata tudo como uma "empresa" com "transportadoras" dentro, sem distinguir quem executa de quem é dono, nem quem pode ver o quê.

## Decisão

1. **Tenant é a organização (CNPJ).** Cada organização é dona dos dados que produz. O RLS continua estrito: ninguém lê dado de outra organização por padrão. Um cliente isolado é só uma organização sem concessões; o ecossistema não pesa para quem não o usa.
2. **Organização executora ≠ organização proprietária.** A OS pertence a quem executa (a oficina). O ativo pertence ao dono (transportadora ou embarcador). O vínculo entre os dois é explícito.
3. **Compartilhamento é um acordo concedido por quem é dono do dado**, com escopo (quais ativos ou frotas), nível, validade e revogação, e todo acesso é auditado. Níveis propostos:
   - **Status:** na oficina ou liberado, previsão de saída.
   - **Serviços:** o que foi feito e quando, componentes, retrabalho.
   - **Valores cobrados:** quanto a oficina cobrou por OS.
   - **Completo:** mão de obra detalhada e custo interno. Existe apenas entre organizações do mesmo grupo.
4. **O dado compartilhado é publicado, não consultado.** Eventos alimentam uma visão compartilhada por concessão, que é a única coisa que o outro lado lê. As tabelas internas nunca são expostas. Revogar a concessão apaga a visão.
5. **Custo interno ≠ valor cobrado.** A OS de uma oficina terceira tem custo interno e valor cobrado do cliente. Os indicadores do dono do ativo usam o valor cobrado; os da oficina usam o custo interno.
6. **Operador ao longo do tempo.** O ativo tem dono e um histórico de operador (qual transportadora roda com ele, de quando até quando), com código de frota que acompanha essa história. O custo de um período pertence a quem operava naquele período.
7. **Solicitação de manutenção entre organizações.** O dono do ativo pede manutenção a uma oficina prestadora; a oficina aceita e executa numa OS própria, e o resultado volta ao dono no nível combinado.
8. **Estoque com dono e local separados (consignado).** Um depósito pode pertencer a uma organização e estar fisicamente em outra (almoxarifado da Suzano dentro da Vale). Peça que sai dele para uma OS da oficina é consumo do dono do estoque.
9. **Grupo econômico.** Organizações do mesmo grupo (ex.: Suzano e a oficina própria, com outro CNPJ) têm acesso completo entre si; é o único caso do nível "completo".
10. **Oficinas se especializam por tipo de ativo.** A organização declara o que atende (só carretas, como a Vale das Carretas; só cavalos; ou ambos, como a JSL e a oficina da Suzano). Isso filtra catálogo de serviços, componentes e telas. A mesma composição pode ser mantida por duas oficinas (cavalo numa, carretas noutra), e o dono vê o custo consolidado da composição a partir do que cada uma compartilha.
11. **A organização vê o que compartilha.** Uma tela "o que [organização] vê" mostra exatamente o nível e o escopo concedidos.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Um tenant por grupo, com "transportadoras" dentro (modelo do v1) | Não representa a oficina terceira como dona dos próprios dados; força visibilidade total ou nenhuma |
| Exceções no RLS para leitura entre organizações | Cada exceção é um risco de vazamento; a performance piora; revogar exige mexer em política |
| Compartilhamento por usuário convidado na outra organização | Mistura identidades e dá acesso às tabelas internas; não permite nível parcial |

## Consequências

- **Positivas:** cada parte controla o que mostra, o que reduz boicote. Abre crescimento por convite: um embarcador traz parceiros para o ecossistema. Os indicadores ficam corretos para cada ponto de vista.
- **Negativas:** o modelo de dados e a publicação por evento ficam mais complexos. O mesmo caminhão pode existir em mais de uma organização, e a identidade dele (placa, chassi) precisa ser reconciliada.
- **Riscos:** vazamento pela visão compartilhada se um evento publicar campo além do nível; mitigado por testes de isolamento por nível, gerados a partir do catálogo de níveis.

## Lançamento

Lançamento único (decidido em 26/09/2026): compartilhamento por nível, solicitação de manutenção entre organizações, estoque consignado e grupo econômico entram juntos no lançamento, sem etapa de piloto separada.

## Pendências

- ~~Piloto~~: Suzano, trazendo os parceiros (26/09/2026).
- Identidade de veículo entre organizações: cadastro do dono, com operador ao longo do tempo; a oficina prestadora acessa pelo vínculo da solicitação ou do acordo.
- ~~Quem paga~~: os dois modelos, assinatura própria ou patrocínio do embarcador (26/09/2026). Preço em análise na economia do produto.
