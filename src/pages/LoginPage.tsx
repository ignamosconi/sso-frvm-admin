import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Title,
  Alert,
  Group,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas. Verificá tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <Box style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Card withBorder shadow="sm" radius="md" w={360} p="xl">
        <Group mb="xs" gap="xs">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: '#f5a705',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text fw={800} size="xs" c="#1a1200">SSO</Text>
          </Box>
          <Text fw={600} size="sm">UTN FRVM</Text>
        </Group>

        <Title order={2} mb={4}>Iniciar sesión</Title>
        <Text size="sm" c="dimmed" mb="lg">Panel de administración del SSO</Text>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Usuario"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            mb="sm"
            required
          />
          <PasswordInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb="lg"
            required
          />
          <Button
            type="submit"
            fullWidth
            loading={loading}
            style={{ background: '#f5a705', color: '#1a1200' }}
          >
            Ingresar
          </Button>
        </form>
      </Card>
    </Box>
  );
}