# Glossário do Zelo

**Objetivo:** esclarecer os termos de domínio e nomes usados no código e nas telas.

| Termo | Significado neste projeto |
|---|---|
| API | Serviço FastAPI em `backend/`, compartilhado pelo portal web e app Expo. |
| Cuidador | Pessoa vinculada ao cuidado domiciliar; o cadastro público atual cria perfil `paciente`, podendo guardar dados do cuidador nos campos do paciente. |
| ESAS | Edmonton Symptom Assessment System. O backend recebe nove escores centrais de 0 a 10 e também aceita constipação como campo adicional opcional. |
| Gravidade ESAS | Classificação `leve` (0–3), `moderada` (4–6) ou `grave` (7–10), calculada pelo maior escore central. |
| Triagem de dor | Perguntas estruturadas após intensidade de dor alta; registra respostas e cria um alerta para a equipe. |
| Dose de resgate | Registro pontual de dose prescrita já tomada; o endpoint não cria uma prescrição nova. |
| Alerta clínico | Registro persistente com severidade e estado (`Novo`, `Em revisão`, `Tratado`) apresentado à equipe. |
| Evolução clínica | Nota de acompanhamento profissional ligada ao paciente. |
| Mapa corporal | Registro de região anatômica, tipo de ocorrência e intensidade. |
| Papel | Valor de perfil em `User`, usado pela API para limitar operações; papéis são definidos em cadastro/seed e dependência de autorização. |
| Token Bearer | Token assinado pelo backend e enviado no cabeçalho `Authorization`; validade padrão de oito horas. |
| RENAME | Relação Nacional de Medicamentos Essenciais. O termo aparece em documentação histórica, mas os endpoints armazenam campos de medicação; o código não consulta uma fonte RENAME externa. |
| SPA | Single Page Application React carregada pelo `frontend/index.html`; páginas são selecionadas por estado em `App.tsx`, sem roteador externo. |
| Expo | Ferramenta/runtime React Native usada pelo app em `mobile-app/`. |

Para detalhes de implementação, consulte [Arquitetura](ARQUITETURA.md), [Backend](BACKEND.md), [Frontend](FRONTEND.md) e [Como rodar](COMO-RODAR.md).
