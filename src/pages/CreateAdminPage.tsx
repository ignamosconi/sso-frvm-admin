import { useState } from 'react';
import {
  Box, Title, Text, Card, TextInput, PasswordInput,
  Button, Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { adminsApi } from '@/api/adminApi';
import { CreateAdminPayload } from '@/types/api.types';

export function CreateAdminPage() {
  const [username, setUsername] = useState('');
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
      const payload: CreateAdminPayload = { username, password };
      await adminsApi.create(payload);
      setSuccess(true);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al crear el administrador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title order={2} mb={4}>Crear administrador</Title>
      <Text c="dimmed" size="sm" mb="xl">Agregá un nuevo admin al sistema.</Text>

      <Card withBorder radius="md" p="xl" maw={420}>
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>
        )}
        {success && (
          <Alert icon={<IconCheck size={16} />} color="green" mb="md">
            Administrador creado correctamente.
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Usuario"
            placeholder="nuevo_admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            mb="sm"
            required
            minLength={3}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb="lg"
            required
            minLength={8}
          />
          <Button
            type="submit"
            fullWidth
            loading={loading}
            style={{ background: '#f5a705', color: '#1a1200' }}
          >
            Crear administrador
          </Button>
        </form>
      </Card>
    </Box>
  );
}