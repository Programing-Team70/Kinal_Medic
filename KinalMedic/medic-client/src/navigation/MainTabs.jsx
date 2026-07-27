import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, isStaff, isStudentRole } from "../shared/constants/theme";
import { useAuthStore } from "../shared/store/authStore";

import HomeScreen from "../features/home/screens/HomeScreen";
import MedicalRecordsScreen from "../features/medical/screens/MedicalRecordsScreen";
import InventoryScreen from "../features/inventory/screens/InventoryScreen";
import NotificationScreen from "../features/notification/screens/NotificationScreen";
import EmergencyScreen from "../features/notification/screens/EmergencyScreen";
import AvailabilityScreen from "../features/availability/screens/AvailabilityScreen";
import UsersScreen from "../features/users/screens/UsersScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const tabIcon = (routeName, color, size) => {
  const map = {
    Home: "home",
    Medical: "medical-services",
    Inventory: "inventory",
    Notifications: "notifications",
    Emergency: "warning",
    Availability: "badge",
    Users: "people",
    Profile: "person",
  };
  return (
    <MaterialIcons
      name={map[routeName] || "circle"}
      size={size}
      color={color}
    />
  );
};

const MainTabs = () => {
  const role = useAuthStore((s) => s.user?.role);
  const staff = isStaff(role);
  const student = isStudentRole(role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "rgba(255,255,255,0.92)",
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "700",
        },
        sceneStyle: {
          backgroundColor: "transparent",
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.94)",
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => tabIcon(route.name, color, size),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Kinal Medic", tabBarLabel: "Inicio" }}
      />

      {staff ? (
        <Tab.Screen
          name="Medical"
          component={MedicalRecordsScreen}
          options={{ title: "Registro", tabBarLabel: "Médico" }}
        />
      ) : null}

      {staff ? (
        <Tab.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{ title: "Inventario", tabBarLabel: "Inventario" }}
        />
      ) : null}

      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: "Notificaciones",
          tabBarLabel: "Notif.",
        }}
      />

      {student ? (
        <Tab.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            title: "Emergencia",
            tabBarLabel: "Emergencia",
            tabBarActiveTintColor: COLORS.error || "#dc2626",
          }}
        />
      ) : null}

      <Tab.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{ title: "Estado Profesor", tabBarLabel: "Estado" }}
      />

      {staff ? (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{ title: "Usuarios", tabBarLabel: "Usuarios" }}
        />
      ) : null}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Mi Perfil", tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
