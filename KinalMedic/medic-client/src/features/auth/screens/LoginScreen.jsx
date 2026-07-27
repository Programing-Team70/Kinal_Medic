import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth";

const logo = require("../../../../assets/img/Logo_Enfermeria_Kinal.png");

const LoginScreen = ({ navigation }) => {
  const { handleLogin, loading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const res = await handleLogin({
      identifier: data.identifier,
      password: data.password,
    });
    if (!res.success) {
      Alert.alert(
        "Error de inicio de sesión",
        res.error || "Credenciales incorrectas"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Kinal Medic</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="identifier"
            rules={{ required: "Ingresa tu correo o carnet" }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Correo o carnet"
                placeholder="admin@kinal.edu.gt  o  2024332"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                error={errors.identifier?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: "La contraseña es obligatoria" }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title={loading ? "Validando..." : "Iniciar Sesión"}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Eres un alumno nuevo? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Register")}
            >
              ¡Regístrate aquí!
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logo: {
    height: 100,
    width: 220,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  link: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default LoginScreen;
