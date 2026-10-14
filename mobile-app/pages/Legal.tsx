import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          'No cadastro atual, o aplicativo solicita nome, email e senha. A senha é usada temporariamente em memória para validação e não é gravada no armazenamento local nem enviada a um servidor pelo código atual.',
      },
      {
        titulo: '2. Armazenamento no dispositivo',
        texto:
          'Após a validação do cadastro, nome, email e data de criação do perfil são salvos neste dispositivo pelo AsyncStorage. Esse armazenamento local não possui criptografia adicional implementada pelo aplicativo. Ainda não há uma opção para excluir o perfil dentro do app.',
      },
      {
        titulo: '3. Compartilhamento e serviços externos',
        texto:
          'A versão atual não envia os dados do perfil a um servidor. Os botões de acesso por Google, Facebook e X ainda não estão conectados e não iniciam autenticação nem compartilhamento de dados.',
      },
      {
        titulo: '4. Controle dos dados',
        texto:
          'Como os dados do perfil ficam no armazenamento local do aplicativo, limpar os dados do app ou desinstalá-lo pode removê-los deste dispositivo. O comportamento de cópias de segurança depende das configurações do sistema operacional.',
      },
      {
        titulo: '5. Próximas integrações',
        texto:
          'Se o Zelo passar a enviar dados a servidores, integrar provedores de login ou tratar informações de saúde, esta política deverá ser atualizada antes da ativação desses recursos, com a identificação do controlador, as finalidades, as bases legais, os prazos de retenção e os canais para exercício dos direitos previstos na LGPD.',
      },
    ],
  },
};

export default function LegalScreen({
  documento,
  onSelecionarDocumento,
  onVoltar,
}: LegalScreenProps) {
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

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#174C3D',
  },
  cabecalho: {
    minHeight: 76,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#174C3D',
  },
  marca: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  voltar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  corpo: {
    flex: 1,
    backgroundColor: '#F3F7F3',
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
    color: '#B55D45',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  titulo: {
    color: '#173D33',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  },
  atualizacao: {
    color: '#718078',
    fontSize: 12,
    marginTop: 8,
  },
  abas: {
    flexDirection: 'row',
    padding: 4,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#E4ECE6',
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
    backgroundColor: '#26745C',
  },
  textoAba: {
    color: '#385C4D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  textoAbaSelecionada: {
    color: '#FFFFFF',
  },
  secoes: {
    gap: 22,
  },
  secao: {
    gap: 7,
  },
  tituloSecao: {
    color: '#28463B',
    fontSize: 16,
    fontWeight: '700',
  },
  textoSecao: {
    color: '#52645B',
    fontSize: 14,
    lineHeight: 22,
  },
  nota: {
    color: '#718078',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D9E3DC',
  },
});