import { NavLink, useNavigate } from 'react-router-dom';
import {
  Stack,
  Text,
  UnstyledButton,
  Group,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconApps,
  IconQuestionMark,
  IconLogout,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/admins', label: 'Administradores', icon: IconUsers },
  { to: '/clients', label: 'Clientes OAuth', icon: IconApps },
  { to: '/faqs', label: 'FAQs', icon: IconQuestionMark },
];

export function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Stack h="100%" justify="space-between" p="md">
      <Box>
        <Group mb="xl" gap="xs">
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
          <Box>
            <Text fw={600} size="sm" lh={1.2}>SSO FRVM</Text>
            <Text size="xs" c="dimmed">Panel de administración</Text>
          </Box>
        </Group>

        <Stack gap={4}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <UnstyledButton
                  w="100%"
                  px="sm"
                  py={8}
                  style={(theme) => ({
                    borderRadius: theme.radius.sm,
                    background: isActive
                      ? 'var(--mantine-color-orange-light)'
                      : 'transparent',
                    color: isActive
                      ? '#f5a705'
                      : 'var(--mantine-color-text)',
                  })}
                >
                  <Group gap="sm">
                    <Icon size={16} />
                    <Text size="sm">{label}</Text>
                  </Group>
                </UnstyledButton>
              )}
            </NavLink>
          ))}
        </Stack>
      </Box>

      <Box>
        <Divider mb="sm" />
        <Group justify="space-between">
          <UnstyledButton onClick={handleLogout}>
            <Group gap="sm">
              <IconLogout size={16} />
              <Text size="sm">Cerrar sesión</Text>
            </Group>
          </UnstyledButton>
          <ThemeToggle />
        </Group>
      </Box>
    </Stack>
  );
}