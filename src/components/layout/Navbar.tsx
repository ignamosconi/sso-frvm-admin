import { NavLink, useNavigate } from 'react-router-dom';
import {
  Stack, Text, UnstyledButton, Group, Box, Divider, Image,
} from '@mantine/core';
import {
  IconDashboard, IconUser, IconUsers,
  IconApps, IconQuestionMark, IconLogout,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import logoUtn from '@/assets/logo-utn.png';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ElementType;
  indent?: boolean;
}

function NavItem({ to, label, icon: Icon, indent }: NavItemProps) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <UnstyledButton
          w="100%"
          px="sm"
          py={7}
          pl={indent ? 'lg' : 'sm'}
          style={(theme) => ({
            borderRadius: theme.radius.sm,
            background: isActive ? 'var(--mantine-color-orange-light)' : 'transparent',
            color: isActive ? '#f5a705' : 'var(--mantine-color-text)',
          })}
        >
          <Group gap="sm">
            <Icon size={15} />
            <Text size="sm">{label}</Text>
          </Group>
        </UnstyledButton>
      )}
    </NavLink>
  );
}

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
          <Image src={logoUtn} w={32} h={32} fit="contain" />
          <Box>
            <Text fw={600} size="sm" lh={1.2}>SSO FRVM</Text>
            <Text size="xs" c="dimmed">Panel de administración</Text>
          </Box>
        </Group>

        <Stack gap={2}>
          <NavItem to="/dashboard" label="Dashboard" icon={IconDashboard} />

          <NavItem to="/admins/me" label="Mi perfil" icon={IconUser} />
          <NavItem to="/admins" label="Administradores" icon={IconUsers} />

          <NavItem to="/clients" label="Clientes OAuth" icon={IconApps} />
          <NavItem to="/faqs" label="FAQs" icon={IconQuestionMark} />
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