import { useState } from 'react';
import {
  Box, Title, Text, Card, TextInput, PasswordInput,
  Button, Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { adminsApi } from '@/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { UpdateAdminPayload } from '@/types/api.types';

export function MyProfilePage() {
  const { adminUsername, setTokens, accessToken, refreshToken } = useAuthStore();
  const [username, setUsername] = useState(adminUsername ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const payload: UpdateAdminPayload = {};
      if (username !== adminUsername) payload.username = username;
      if (password) payload.password = password;
      if (Object.keys(payload).length === 0) {
        setError('No hay cambios para guardar.');
        return;
      }
      await adminsApi.updateSelf(payload);
      setSuccess(true);
      setPassword('');
      // Refrescamos tokens para que el nuevo username quede en el store
      if (accessToken && refreshToken) setTokens(accessToken, refreshToken);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title order={2} mb={4}>Mi perfil</Title>
      <Text c="dimmed" size="sm" mb="xl">Editá tu usuario y contraseña.</Text>

      <Card withBorder radius="md" p="xl" maw={420}>
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>
        )}
        {success && (
          <Alert icon={<IconCheck size={16} />} color="green" mb="md">
            Cambios guardados correctamente.
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
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
            loading={loading}
            style={{ background: '#f5a705', color: '#1a1200' }}
          >
            Guardar cambios
          </Button>
        </form>
      </Card>
    </Box>
  );
}