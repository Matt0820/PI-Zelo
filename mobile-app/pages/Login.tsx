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
import { useVisual, Palette } from '../visual';

type LoginScreenProps = {
  onVoltar: () => void;
  onEntrar: (email: string, senha: string) => Promise<void>;
};

export default function LoginScreen({ onVoltar, onEntrar }: LoginScreenProps) {
  const { cores } = useVisual();
  const estilos = criarEstilos(cores);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    // Validação local para evitar requisições com dados vazios ou inválidos.
    if (!email.trim() || !senha) {
      Alert.alert('Faltam alguns dados', 'Informe seu email, CPF ou prontuário e sua senha.');
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
                <Text style={estilos.rotulo}>Email, CPF ou prontuário</Text>
                <TextInput
                  style={estilos.campo}
                  placeholder="voce@email.com ou CPF/prontuário"
                  placeholderTextColor="#6E655C"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoComplete="username"
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
                  placeholderTextColor="#6E655C"
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

            <Text style={estilos.textoAjuda}>
              Entre com o email, CPF ou prontuário cadastrado.
            </Text>

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

function criarEstilos(cores: Palette) { return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  cabecalho: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    backgroundColor: cores.primaria,
  },
  logo: {
    width: 36,
    height: 64,
  },
  marca: {
    color: cores.superficie,
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
    color: cores.superficie,
    fontSize: 14,
    fontWeight: '600',
  },
  corpo: {
    flex: 1,
    backgroundColor: cores.fundo,
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
    color: cores.perigo,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  titulo: {
    color: cores.texto,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: 0,
    maxWidth: 360,
  },
  descricao: {
    color: cores.textoSecundario,
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
    color: cores.texto,
    fontSize: 14,
    fontWeight: '600',
  },
  acaoCampo: {
    color: cores.primaria,
    fontSize: 13,
    fontWeight: '600',
  },
  campo: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    color: cores.texto,
    fontSize: 15,
  },
  botao: {
    minHeight: 56,
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: cores.primaria,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoPressionado: {
    backgroundColor: cores.primariaHover,
  },
  textoBotao: {
    color: cores.superficie,
    fontSize: 16,
    fontWeight: '700',
  },
  setaBotao: {
    color: cores.superficie,
    fontSize: 19,
    lineHeight: 22,
  },
  textoAjuda: {
    color: cores.textoSecundario,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
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
    color: cores.textoSecundario,
    fontSize: 14,
  },
  linkRodape: {
    color: cores.primaria,
    fontSize: 14,
    fontWeight: '700',
  },
});
}
