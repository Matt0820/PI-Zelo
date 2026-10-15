/**
 * Tela de login do app Zelo.
 *
 * Esta interface concentra a autenticação de usuários e mantém o fluxo simples:
 * validar dados, chamar a API e encaminhar para a home do app.
 */
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginScreenProps = {
  onVoltar: () => void;
  onEntrar: (email: string, senha: string) => Promise<void>;
};

export default function LoginScreen({ onVoltar, onEntrar }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    // Validação local para evitar requisições com dados vazios ou inválidos.
    if (!email.trim() || !senha) {
      Alert.alert('Faltam alguns dados', 'Preencha seu email e sua senha para continuar.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Email inválido', 'Confira o endereço de email informado.');
      return;
    }

    setEntrando(true);
    try {
      await onEntrar(email.trim(), senha);
    } catch (error) {
      Alert.alert('Não foi possível entrar', error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
    } finally {
      setEntrando(false);
    }
  }

  function entrarCom(provedor: string) {
    // Login social ainda está em fase de planejamento/integracao futura.
    Alert.alert(
      `Login com ${provedor}`,
      `A integração com ${provedor} ainda precisa ser configurada.`,
    );
  }

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        <Image
          source={require('../assets/logo.png')}
          style={estilos.logo}
          resizeMode="contain"
          accessibilityLabel="Zelo - Cuidados Paliativos"
        />
        <Text style={estilos.marca}>zelo</Text>
        <Pressable
          style={estilos.botaoVoltar}
          onPress={onVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao cadastro"
          hitSlop={8}
        >
          <Text style={estilos.textoVoltar}>‹ Voltar</Text>
        </Pressable>
      </View>

      <View style={estilos.corpo}>
        <KeyboardAvoidingView
          style={estilos.keyboardArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={estilos.introducao}>
              <Text style={estilos.sobreTitulo}>BEM-VINDO DE VOLTA</Text>
              <Text style={estilos.titulo}>Acesse sua conta.</Text>
              <Text style={estilos.descricao}>
                Entre para continuar perto de quem importa.
              </Text>
            </View>

            <View style={estilos.formulario}>
              <View style={estilos.campoGrupo}>
                <Text style={estilos.rotulo}>Email</Text>
                <TextInput
                  style={estilos.campo}
                  placeholder="voce@email.com"
                  placeholderTextColor="#87958E"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={estilos.campoGrupo}>
                <View style={estilos.rotuloLinha}>
                  <Text style={estilos.rotulo}>Senha</Text>
                  <Pressable
                    onPress={() => setSenhaVisivel(!senhaVisivel)}
                    accessibilityRole="button"
                    accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Text style={estilos.acaoCampo}>{senhaVisivel ? 'Ocultar' : 'Mostrar'}</Text>
                  </Pressable>
                </View>
                <TextInput
                  style={estilos.campo}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#87958E"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!senhaVisivel}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={entrar}
                />
              </View>

              <Pressable
                style={({ pressed }) => [estilos.botao, pressed && estilos.botaoPressionado]}
                onPress={entrar}
                disabled={entrando}
                accessibilityRole="button"
              >
                <Text style={estilos.textoBotao}>{entrando ? 'Entrando...' : 'Entrar'}</Text>
                <Text style={estilos.setaBotao}>→</Text>
              </Pressable>
            </View>

            <View style={estilos.alternativas}>
              <View style={estilos.divisor}>
                <View style={estilos.linhaDivisoria} />
                <Text style={estilos.textoDivisor}>OU ENTRE COM</Text>
                <View style={estilos.linhaDivisoria} />
              </View>

              <Pressable
                style={({ pressed }) => [estilos.botaoSocial, pressed && estilos.botaoSocialPressionado]}
                onPress={() => entrarCom('Google')}
                accessibilityRole="button"
                accessibilityLabel="Entrar com Google"
              >
                <Text style={[estilos.marcaSocial, estilos.marcaGoogle]}>G</Text>
                <Text style={estilos.textoSocial}>Continuar com Google</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [estilos.botaoSocial, pressed && estilos.botaoSocialPressionado]}
                onPress={() => entrarCom('Facebook')}
                accessibilityRole="button"
                accessibilityLabel="Entrar com Facebook"
              >
                <Text style={[estilos.marcaSocial, estilos.marcaFacebook]}>f</Text>
                <Text style={estilos.textoSocial}>Continuar com Facebook</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [estilos.botaoSocial, pressed && estilos.botaoSocialPressionado]}
                onPress={() => entrarCom('X (Twitter)')}
                accessibilityRole="button"
                accessibilityLabel="Entrar com X, antigo Twitter"
              >
                <Text style={[estilos.marcaSocial, estilos.marcaX]}>X</Text>
                <Text style={estilos.textoSocial}>Continuar com X</Text>
              </Pressable>
            </View>

            <View style={estilos.rodape}>
              <Text style={estilos.textoRodape}>Ainda não tem uma conta?</Text>
              <Pressable accessibilityRole="button" onPress={onVoltar}>
                <Text style={estilos.linkRodape}>Criar conta</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    backgroundColor: '#174C3D',
  },
  logo: {
    width: 36,
    height: 64,
  },
  marca: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
  },
  botaoVoltar: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  textoVoltar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  corpo: {
    flex: 1,
    backgroundColor: '#F3F7F3',
  },
  keyboardArea: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 28,
  },
  introducao: {
    marginBottom: 30,
  },
  sobreTitulo: {
    color: '#B55D45',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  titulo: {
    color: '#173D33',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: 0,
    maxWidth: 360,
  },
  descricao: {
    color: '#63736B',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 360,
  },
  formulario: {
    gap: 20,
  },
  campoGrupo: {
    gap: 8,
  },
  rotuloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotulo: {
    color: '#28463B',
    fontSize: 14,
    fontWeight: '600',
  },
  acaoCampo: {
    color: '#26745C',
    fontSize: 13,
    fontWeight: '600',
  },
  campo: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#D9E3DC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    color: '#173D33',
    fontSize: 15,
  },
  botao: {
    minHeight: 56,
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#26745C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoPressionado: {
    backgroundColor: '#1E624D',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  setaBotao: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 22,
  },
  alternativas: {
    gap: 10,
    marginTop: 24,
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  linhaDivisoria: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9E3DC',
  },
  textoDivisor: {
    color: '#718078',
    fontSize: 10,
    fontWeight: '700',
  },
  botaoSocial: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D9E3DC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  botaoSocialPressionado: {
    backgroundColor: '#EAF1EC',
  },
  marcaSocial: {
    width: 22,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '700',
  },
  marcaGoogle: {
    color: '#4285F4',
  },
  marcaFacebook: {
    color: '#1877F2',
  },
  marcaX: {
    color: '#111111',
  },
  textoSocial: {
    color: '#28463B',
    fontSize: 14,
    fontWeight: '600',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 'auto',
    paddingTop: 32,
  },
  textoRodape: {
    color: '#63736B',
    fontSize: 14,
  },
  linkRodape: {
    color: '#26745C',
    fontSize: 14,
    fontWeight: '700',
  },
});