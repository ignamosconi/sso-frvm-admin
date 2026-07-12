import {
  Box, Title, Text, Accordion, Code, Anchor, Group,
  ThemeIcon, List, Card,
} from '@mantine/core';
import { IconBook, IconServer, IconPlus, IconHelp } from '@tabler/icons-react';

export function FaqsPage() {
  return (
    <Box>
      <Title order={2} mb={4}>FAQs</Title>
      <Text c="dimmed" mb="xl" size="sm">
        Guía rápida.
      </Text>

      <Card withBorder radius="md" p="lg" mb="xl">
        <Group mb="sm">
          <ThemeIcon variant="light" color="orange" radius="md">
            <IconBook size={16} />
          </ThemeIcon>
          <Text fw={600}>Repositorios</Text>
        </Group>
        <List spacing="xs" size="sm">
          <List.Item>
            <Text size="sm">
              Backend SSO:{' '}
              <Anchor href="https://github.com/ignamosconi/sso-frvm" target="_blank">
                github.com/ignamosconi/sso-frvm
              </Anchor>
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              Panel admin:{' '}
              <Anchor href="https://github.com/ignamosconi/sso-frvm-admin" target="_blank">
                github.com/ignamosconi/sso-frvm-admin
              </Anchor>
            </Text>
          </List.Item>
        </List>
      </Card>

      <Accordion variant="separated" radius="md">
        <Accordion.Item value="levantar-backend">
          <Accordion.Control icon={<IconServer size={16} />}>
            ¿Cómo levanto el backend del SSO?
          </Accordion.Control>
          <Accordion.Panel>
            <List size="sm" spacing="xs">
              <List.Item>Cloná el repo <Code>sso-frvm</Code></List.Item>
              <List.Item>Copiá <Code>.env.example</Code> a <Code>.env</Code> y completá los valores</List.Item>
              <List.Item>Corré <Code>npm install</Code></List.Item>
              <List.Item>Levantá la base de datos: <Code>docker compose up -d</Code></List.Item>
              <List.Item>Levantá el servidor: <Code>npm run start:prod</Code></List.Item>
              <List.Item>El servidor queda en <Code>http://localhost:3000</Code></List.Item>
              <List.Item>La documentación de la API está en <Code>http://localhost:3000/docs</Code> (requiere usuario y contraseña del .env)</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="levantar-panel">
          <Accordion.Control icon={<IconServer size={16} />}>
            ¿Cómo levanto este panel de administración?
          </Accordion.Control>
          <Accordion.Panel>
            <List size="sm" spacing="xs">
              <List.Item>Cloná el repo <Code>sso-frvm-admin</Code></List.Item>
              <List.Item>Copiá <Code>.env.example</Code> a <Code>.env</Code> y verificá que <Code>VITE_API_BASE_URL</Code> apunte al backend</List.Item>
              <List.Item>Corré <Code>npm install</Code></List.Item>
              <List.Item>Corré <Code>npm run dev</Code> para desarrollo o <Code>npm run build</Code> para producción</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="nuevo-cliente">
          <Accordion.Control icon={<IconPlus size={16} />}>
            ¿Cómo registro una nueva app para que use el SSO?
          </Accordion.Control>
          <Accordion.Panel>
            <List size="sm" spacing="xs">
              <List.Item>Andá a la sección <strong>Clientes OAuth</strong> en el menú</List.Item>
              <List.Item>Hacé click en <strong>Nuevo cliente</strong></List.Item>
              <List.Item>Completá el nombre de la app y la redirect URI que te dió el desarrollador de esa app</List.Item>
              <List.Item>El sistema genera automáticamente el <Code>client_secret</Code></List.Item>
              <List.Item>Copiá el <Code>client_id</Code> (el número) y el <Code>client_secret</Code> y pasáselos al desarrollador de la app</List.Item>
              <List.Item>El desarrollador puede leer el README del repo <Code>sso-frvm</Code> para entender cómo integrar su app</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="nuevo-admin">
          <Accordion.Control icon={<IconHelp size={16} />}>
            ¿Cómo creo un nuevo administrador del panel?
          </Accordion.Control>
          <Accordion.Panel>
            <List size="sm" spacing="xs">
              <List.Item>Andá a la sección <strong>Administradores</strong> en el menú</List.Item>
              <List.Item>Hacé click en <strong>Nuevo admin</strong></List.Item>
              <List.Item>Completá el usuario y la contraseña</List.Item>
              <List.Item>El nuevo admin puede ingresar al panel con esas credenciales</List.Item>
              <List.Item>Las credenciales de admin son independientes de las de autogestión</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="secret-perdido">
          <Accordion.Control icon={<IconHelp size={16} />}>
            Un desarrollador perdió el client_secret de su app, ¿qué hago?
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="sm">
              Andá a <strong>Clientes OAuth</strong>, buscá la app y hacé click en el ícono de regenerar secret (ícono de recarga). El sistema genera uno nuevo y el anterior queda invalidado inmediatamente. Pasale el nuevo secret al desarrollador.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}