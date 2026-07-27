import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  CARRERAS,
  EDUCATION_LEVELS,
  SECCIONES,
} from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth";

const logo = require("../../../../assets/img/Logo_Enfermeria_Kinal.png");

const RegisterScreen = ({ navigation }) => {
  const { handleRegister, loading } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      carnet: "",
      educationLevel: "",
      carrera: "",
      seccion: "",
      hasAllergies: false,
      allergies: "",
      guardianEmail: "",
      email: "",
      password: "",
    },
  });

  const educationLevel = watch("educationLevel");
  const hasAllergies = watch("hasAllergies");
  const selectedCarrera = watch("carrera");
  const selectedSeccion = watch("seccion");

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      carnet: data.carnet.trim(),
      educationLevel: data.educationLevel,
      seccion: data.seccion,
      hasAllergies: Boolean(data.hasAllergies),
      allergies: data.hasAllergies ? data.allergies.trim() : "Ninguna",
      guardianEmail: data.guardianEmail.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: "STUDENT_ROLE",
    };

    if (data.educationLevel === "DIVERSIFICADO") {
      payload.carrera = data.carrera;
    }

    const res = await handleRegister(payload);
    if (res.success) {
      Alert.alert(
        "Registro exitoso",
        res.message || "Ya puedes iniciar sesión",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } else {
      Alert.alert("Error", res.error || "No se pudo completar el registro");
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
          <Text style={styles.subtitle}>Registro de estudiante</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            rules={{ required: "El nombre es obligatorio" }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nombre completo"
                placeholder="Tu nombre y apellido"
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="carnet"
            rules={{ required: "El carnet es obligatorio" }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Carnet estudiantil"
                placeholder="Ej. 2024332"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                error={errors.carnet?.message}
              />
            )}
          />

          <Text style={styles.label}>Nivel educativo</Text>
          <View style={styles.chips}>
            {EDUCATION_LEVELS.map((item) => {
              const active = educationLevel === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => {
                    setValue("educationLevel", item.value, {
                      shouldValidate: true,
                    });
                    if (item.value === "BASICO") {
                      setValue("carrera", "");
                    }
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.educationLevel ? (
            <Text style={styles.errorText}>
              {errors.educationLevel.message}
            </Text>
          ) : null}
          <Controller
            control={control}
            name="educationLevel"
            rules={{ required: "Selecciona el nivel educativo" }}
            render={() => null}
          />

          {educationLevel === "DIVERSIFICADO" ? (
            <>
              <Text style={styles.label}>Carrera / Especialidad</Text>
              <View style={styles.chips}>
                {CARRERAS.map((item) => {
                  const active = selectedCarrera === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() =>
                        setValue("carrera", item, { shouldValidate: true })
                      }
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.carrera ? (
                <Text style={styles.errorText}>{errors.carrera.message}</Text>
              ) : null}
              <Controller
                control={control}
                name="carrera"
                rules={{
                  required:
                    educationLevel === "DIVERSIFICADO"
                      ? "Selecciona tu carrera"
                      : false,
                }}
                render={() => null}
              />
            </>
          ) : null}

          <Text style={styles.label}>Sección</Text>
          <View style={styles.chips}>
            {SECCIONES.map((item) => {
              const active = selectedSeccion === item;
              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setValue("seccion", item, { shouldValidate: true })
                  }
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.seccion ? (
            <Text style={styles.errorText}>{errors.seccion.message}</Text>
          ) : null}
          <Controller
            control={control}
            name="seccion"
            rules={{ required: "Selecciona tu sección" }}
            render={() => null}
          />

          <Text style={styles.label}>¿Es alérgico?</Text>
          <View style={styles.chips}>
            {[
              { value: false, label: "No" },
              { value: true, label: "Sí" },
            ].map((item) => {
              const active = hasAllergies === item.value;
              return (
                <Pressable
                  key={String(item.value)}
                  onPress={() => {
                    setValue("hasAllergies", item.value, {
                      shouldValidate: true,
                    });
                    if (!item.value) setValue("allergies", "");
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {hasAllergies ? (
            <Controller
              control={control}
              name="allergies"
              rules={{
                required: hasAllergies
                  ? "Indica a qué eres alérgico"
                  : false,
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="¿A qué es alérgico?"
                  placeholder="Ej. Penicilina, mariscos..."
                  onChangeText={onChange}
                  value={value}
                  error={errors.allergies?.message}
                />
              )}
            />
          ) : null}

          <Controller
            control={control}
            name="guardianEmail"
            rules={{
              required: "El correo del encargado es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo del encargado inválido",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Correo del encargado"
                placeholder="encargado@gmail.com"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.guardianEmail?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: "El email es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo inválido",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Correo electrónico (estudiante)"
                placeholder="alumno@kinal.edu.gt"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: "La contraseña es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Contraseña de acceso"
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
            title={loading ? "Registrando..." : "Registrar Estudiante"}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Login")}
            >
              Iniciar Sesión
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
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  logo: {
    height: 80,
    width: 200,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    fontWeight: "600",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
  chipTextActive: {
    color: COLORS.surface,
    fontWeight: "700",
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: "row",
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

export default RegisterScreen;
