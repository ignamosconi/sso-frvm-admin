import { useEffect, useState } from 'react';
import {
  Box, Title, Text, Card, Group, ThemeIcon, Badge,
} from '@mantine/core';
import { IconShieldCheck, IconShieldX } from '@tabler/icons-react';
import { healthApi } from '@/api/healthApi';

export function DashboardPage() {
  const [status, setStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const check = async () => {
    setStatus('checking');
    const ok = await healthApi.check();
    setStatus(ok ? 'up' : 'down');
    setCheckedAt(new Date().toLocaleTimeString('es-AR'));
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const isUp = status === 'up';
  const isChecking = status === 'checking';

  return (
    <Box>
      <Title order={2} mb={4}>Dashboard</Title>
      <Text c="dimmed" mb="xl">Bienvenido al panel de administración del SSO FRVM.</Text>

      <Card withBorder radius="md" p="lg" maw={400}>
        <Group mb="sm">
          <ThemeIcon
            variant="light"
            color={isChecking ? 'gray' : isUp ? 'green' : 'red'}
            size="lg"
            radius="md"
          >
            {isUp ? <IconShieldCheck size={18} /> : <IconShieldX size={18} />}
          </ThemeIcon>
          <Text fw={600}>Estado del SSO</Text>
        </Group>

        <Group gap="xs">
          <Badge
            color={isChecking ? 'gray' : isUp ? 'green' : 'red'}
            variant="light"
            size="lg"
          >
            {isChecking ? 'Verificando...' : isUp ? 'En línea' : 'Sin conexión'}
          </Badge>
        </Group>

        {checkedAt && (
          <Text size="xs" c="dimmed" mt="sm">
            Último chequeo: {checkedAt} · Se actualiza cada 30 segundos
          </Text>
        )}
      </Card>
    </Box>
  );
}