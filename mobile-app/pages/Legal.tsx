/**
 * Tela de termos e privacidade do app.
 *
 * Centraliza as informações legais com duas abas: termos de uso e política de
 * privacidade. Essa separação facilita a manutenção à medida que o projeto cresce.
 */
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisual, Palette } from '../visual';

type DocumentoLegal = 'termos' | 'privacidade';

type LegalScreenProps = {
  documento: DocumentoLegal;
  onSelecionarDocumento: (documento: DocumentoLegal) => void;
  onVoltar: () => void;
};

type SecaoLegal = {
  titulo: string;
  texto: string;
};

// O conteúdo legal está organizado por documento para facilitar o controle de
// textos específicos, versões e futuras atualizações de conformidade.
const documentos: Record<DocumentoLegal, { titulo: string; secoes: SecaoLegal[] }> = {
  termos: {
    titulo: 'Termos de uso',
    secoes: [
      {
        titulo: '1. Sobre o Zelo',
        texto:
          'O Zelo é um aplicativo em desenvolvimento para apoiar conexões relacionadas ao cuidado paliativo. Ao utilizar o aplicativo, você concorda com estes termos. Alguns recursos ainda podem não estar disponíveis.',
      },
      {
        titulo: '2. Cadastro e segurança',
        texto:
          'Informe dados corretos e mantenha suas credenciais em segurança. Não crie cadastros em nome de outra pessoa sem autorização. Você é responsável pelas atividades realizadas com sua conta.',
      },
      {
        titulo: '3. Informações de saúde',
        texto:
          'O aplicativo não substitui avaliação, diagnóstico ou orientação de profissionais de saúde. Não utilize o Zelo para situações de emergência. Em uma urgência, procure os serviços de emergência ou a equipe de saúde responsável.',
      },
      {
        titulo: '4. Uso adequado',
        texto:
          'Utilize o aplicativo de forma lícita e respeitosa. Não tente comprometer sua segurança, interromper seu funcionamento ou acessar dados de outras pessoas sem autorização.',
      },
      {
        titulo: '5. Disponibilidade e alterações',
        texto:
          'Como o Zelo está em desenvolvimento, funcionalidades, conteúdo e disponibilidade podem mudar. Estes termos também poderão ser atualizados; a versão vigente será publicada nesta tela.',
      },
    ],
  },
  privacidade: {
    titulo: 'Política de privacidade',
    secoes: [
      {
        titulo: '1. Dados tratados',
        texto:
          'No cadastro, o app pode enviar à API nome, email, senha, perfil, prontuário, idade, sexo, CPF, telefone, dados do cuidador, diagnóstico, PPS, comorbidades, alergias, tratamento atual e próxima consulta. Campos clínicos são opcionais. O app também envia avaliações ESAS, triagens de dor e medicações quando você usa esses recursos. A senha é enviada à API para autenticação e o backend atual a armazena como hash SHA-256.',
      },
      {
        titulo: '2. Armazenamento e sessão',
        texto:
          'O backend do projeto persiste os dados de perfil e os registros de cuidado no banco configurado pelo projeto. O app mantém no AsyncStorage deste dispositivo os dados básicos necessários para restaurar a sessão (identificador, nome e email) e a preferência visual. O app não implementa criptografia adicional para esse armazenamento local. Sair remove os dados locais da sessão, mas não exclui a conta nem os registros do servidor.',
      },
      {
        titulo: '3. Uso e serviços externos',
        texto:
          'Os dados informados são enviados ao backend Zelo configurado para que os recursos de cadastro, autenticação e acompanhamento funcionem. A infraestrutura, as pessoas autorizadas que podem acessar esses dados, os prazos de retenção e as bases legais devem ser confirmados pelos responsáveis pelo serviço antes de disponibilizar o app a pacientes.',
      },
      {
        titulo: '4. Controle dos dados',
        texto:
          'Ainda não há uma opção para excluir ou corrigir a conta dentro do app. Para solicitar acesso, correção ou exclusão, procure a equipe responsável pelo serviço. Limpar os dados do app ou desinstalá-lo pode remover os dados locais; isso não apaga os dados que já foram enviados ao backend.',
      },
      {
        titulo: '5. Preferências visuais',
        texto:
          'A escolha de tema claro ou escuro, alto contraste ou paleta para daltonismo fica salva localmente neste dispositivo e não é enviada à API.',
      },
    ],
  },
};

/**
 * Exibe o texto legal selecionado e permite voltar ao cadastro.
 */
export default function LegalScreen({ documento, onSelecionarDocumento, onVoltar }: LegalScreenProps) {
  const { cores } = useVisual();
  const estilos = criarEstilos(cores);
  const conteudo = documentos[documento];

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.marca}>zelo</Text>
        <Pressable
          onPress={onVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao cadastro"
          hitSlop={8}
        >
          <Text style={estilos.voltar}>‹ Voltar</Text>
        </Pressable>
      </View>

      <View style={estilos.corpo}>
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
        >
          <Text style={estilos.sobreTitulo}>INFORMAÇÕES LEGAIS</Text>
          <Text style={estilos.titulo}>{conteudo.titulo}</Text>
          <Text style={estilos.atualizacao}>Versão preliminar · 12 de outubro de 2026</Text>

          <View style={estilos.abas}>
            <Pressable
              style={[estilos.aba, documento === 'termos' && estilos.abaSelecionada]}
              onPress={() => onSelecionarDocumento('termos')}
              accessibilityRole="button"
              accessibilityState={{ selected: documento === 'termos' }}
            >
              <Text style={[estilos.textoAba, documento === 'termos' && estilos.textoAbaSelecionada]}>
                Termos de uso
              </Text>
            </Pressable>
            <Pressable
              style={[estilos.aba, documento === 'privacidade' && estilos.abaSelecionada]}
              onPress={() => onSelecionarDocumento('privacidade')}
              accessibilityRole="button"
              accessibilityState={{ selected: documento === 'privacidade' }}
            >
              <Text
                style={[
                  estilos.textoAba,
                  documento === 'privacidade' && estilos.textoAbaSelecionada,
                ]}
              >
                Privacidade
              </Text>
            </Pressable>
          </View>

          <View style={estilos.secoes}>
            {conteudo.secoes.map((secao) => (
              <View key={secao.titulo} style={estilos.secao}>
                <Text style={estilos.tituloSecao}>{secao.titulo}</Text>
                <Text style={estilos.textoSecao}>{secao.texto}</Text>
              </View>
            ))}
          </View>

          <Text style={estilos.nota}>
            Este conteúdo é um rascunho baseado na versão atual do aplicativo e deve ser revisado antes da publicação.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function criarEstilos(cores: Palette) { return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  cabecalho: {
    minHeight: 76,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.primaria,
  },
  marca: {
    color: cores.superficie,
    fontSize: 24,
    fontWeight: '700',
  },
  voltar: {
    color: cores.superficie,
    fontSize: 14,
    fontWeight: '600',
  },
  corpo: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  sobreTitulo: {
    color: cores.perigo,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  titulo: {
    color: cores.texto,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  },
  atualizacao: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 8,
  },
  abas: {
    flexDirection: 'row',
    padding: 4,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: cores.primariaClara,
  },
  aba: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  abaSelecionada: {
    backgroundColor: cores.primaria,
  },
  textoAba: {
    color: cores.textoSecundario,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  textoAbaSelecionada: {
    color: cores.superficie,
  },
  secoes: {
    gap: 22,
  },
  secao: {
    gap: 7,
  },
  tituloSecao: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  textoSecao: {
    color: cores.textoLeve,
    fontSize: 14,
    lineHeight: 22,
  },
  nota: {
    color: cores.textoSecundario,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
});
}
