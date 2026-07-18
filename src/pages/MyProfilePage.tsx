import { useState } from 'react';
import {
  Box, Title, Text, Card, TextInput, PasswordInput,
  Button, Alert, Divider,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconShieldOff } from '@tabler/icons-react';
import { adminsApi } from '@/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { UpdateAdminPayload } from '@/types/api.types';

export function MyProfilePage() {
  const { adminUsername, setTokens, accessToken, refreshToken } = useAuthStore();
  const { reset2fa } = useAuth();

  // Sección perfil
  const [username, setUsername] = useState(adminUsername ?? '');
  const [password, setPassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Sección reset 2FA
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);
    try {
      const payload: UpdateAdminPayload = {};
      if (username !== adminUsername) payload.username = username;
      if (password) payload.password = password;
      if (Object.keys(payload).length === 0) {
        setProfileError('No hay cambios para guardar.');
        return;
      }
      await adminsApi.updateSelf(payload);
      setProfileSuccess(true);
      setPassword('');
      // Refrescamos tokens para que el nuevo username quede en el store
      if (accessToken && refreshToken) setTokens(accessToken, refreshToken);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setProfileError(axiosError?.response?.data?.message ?? 'Error al guardar.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleReset2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setResetLoading(true);
    try {
      await reset2fa(resetPassword);
      setResetSuccess(true);
      setResetPassword('');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setResetError(axiosError?.response?.data?.message ?? 'Error al resetear el 2FA.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box>
      <Title order={2} mb={4}>Mi perfil</Title>
      <Text c="dimmed" size="sm" mb="xl">Editá tu usuario y contraseña.</Text>

      {/* ── Sección perfil ── */}
      <Card withBorder radius="md" p="xl" maw={420} mb="xl">
        {profileError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{profileError}</Alert>
        )}
        {profileSuccess && (
          <Alert icon={<IconCheck size={16} />} color="green" mb="md">
            Cambios guardados correctamente.
          </Alert>
        )}
        <form onSubmit={(e) => void handleProfileSubmit(e)}>
          <TextInput
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            mb="sm"
            required
            minLength={3}
          />
          <PasswordInput
            label="Nueva contraseña (dejá vacío para no cambiar)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb="lg"
            minLength={8}
          />
          <Button
            type="submit"
            fullWidth
            loading={profileLoading}
            style={{ background: '#f5a705', color: '#1a1200' }}
          >
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* ── Sección reset 2FA ── */}
      <Title order={3} mb={4}>Autenticación de dos factores</Title>
      <Text c="dimmed" size="sm" mb="lg">
        Si tu código QR o secret TOTP se vio comprometido, podés resetear el 2FA.
        El próximo login te pedirá configurarlo de nuevo con un nuevo QR.
      </Text>

      <Card withBorder radius="md" p="xl" maw={420}>
        {resetError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{resetError}</Alert>
        )}
        {resetSuccess && (
          <Alert icon={<IconCheck size={16} />} color="green" mb="md">
            2FA reseteado correctamente. El próximo login te pedirá configurarlo de nuevo.
          </Alert>
        )}

        <Alert color="yellow" mb="md" radius="md">
          <Text size="sm">
            Al resetear el 2FA, tu sesión actual sigue activa. La próxima vez que inicies sesión
            deberás escanear un nuevo QR con tu autenticador.
          </Text>
        </Alert>

        <form onSubmit={(e) => void handleReset2fa(e)}>
          <PasswordInput
            label="Confirmá tu contraseña actual"
            placeholder="••••••••"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            mb="lg"
            required
            minLength={8}
            description="Requerida para confirmar tu identidad antes de resetear el 2FA."
          />
          <Button
            type="submit"
            fullWidth
            loading={resetLoading}
            color="red"
            variant="light"
            leftSection={<IconShieldOff size={16} />}
          >
            Resetear autenticador 2FA
          </Button>
        </form>

        <Divider my="md" />
        <Text size="xs" c="dimmed">
          Si solo querés actualizar tu contraseña, usá el formulario de arriba.
          El reset del 2FA no afecta tu contraseña actual.
        </Text>
      </Card>
    </Box>
  );
}