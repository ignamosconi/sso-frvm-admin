import { Card, Grid, Text, Title, Box, ThemeIcon, Group } from '@mantine/core';
import { IconUsers, IconApps, IconShieldCheck } from '@tabler/icons-react';

const stats = [
  { label: 'Administradores', icon: IconUsers, description: 'Gestioná los admins del sistema' },
  { label: 'Clientes OAuth', icon: IconApps, description: 'Apps registradas en el SSO' },
  { label: 'SSO Activo', icon: IconShieldCheck, description: 'El servidor está funcionando' },
];

export function DashboardPage() {
  return (
    <Box>
      <Title order={2} mb={4}>Dashboard</Title>
      <Text c="dimmed" mb="xl">Bienvenido al panel de administración del SSO FRVM.</Text>

      <Grid>
        {stats.map(({ label, icon: Icon, description }) => (
          <Grid.Col key={label} span={{ base: 12, sm: 4 }}>
            <Card withBorder radius="md" p="lg">
              <Group mb="sm">
                <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                  <Icon size={18} />
                </ThemeIcon>
                <Text fw={600}>{label}</Text>
              </Group>
              <Text size="sm" c="dimmed">{description}</Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
}