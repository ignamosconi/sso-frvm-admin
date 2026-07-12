import { useEffect, useState } from 'react';
import {
  Box, Title, Text, Button, Table, ActionIcon, Group,
  Modal, TextInput, Alert, Loader, Center, Badge, CopyButton,
  Tooltip, Code,
} from '@mantine/core';
import {
  IconPlus, IconTrash, IconEdit, IconAlertCircle,
  IconRefresh, IconCopy, IconCheck,
} from '@tabler/icons-react';
import { oauthClientsApi } from '@/api/adminApi';
import { OAuthClientResponse, CreateOAuthClientPayload, UpdateOAuthClientPayload } from '@/types/api.types';

export function ClientsPage() {
  const [clients, setClients] = useState<OAuthClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OAuthClientResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formUri, setFormUri] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setClients(await oauthClientsApi.findAll());
    } catch {
      setError('Error al cargar los clientes OAuth.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormUri('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (client: OAuthClientResponse) => {
    setEditing(client);
    setFormName(client.clientName);
    setFormUri(client.redirectUri);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (editing) {
        const payload: UpdateOAuthClientPayload = {};
        if (formName !== editing.clientName) payload.clientName = formName;
        if (formUri !== editing.redirectUri) payload.redirectUri = formUri;
        await oauthClientsApi.update(editing.id, payload);
      } else {
        const payload: CreateOAuthClientPayload = { clientName: formName, redirectUri: formUri };
        await oauthClientsApi.create(payload);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Error al guardar.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cliente OAuth?')) return;
    try {
      await oauthClientsApi.remove(id);
      load();
    } catch {
      setError('Error al eliminar el cliente.');
    }
  };

  const handleRegenerate = async (id: number) => {
    if (!confirm('¿Regenerar el client secret? El anterior quedará invalidado inmediatamente.')) return;
    try {
      await oauthClientsApi.regenerateSecret(id);
      load();
    } catch {
      setError('Error al regenerar el secret.');
    }
  };

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} mb={4}>Clientes OAuth</Title>
          <Text c="dimmed" size="sm">Apps registradas que pueden usar el SSO.</Text>
        </Box>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          style={{ background: '#f5a705', color: '#1a1200' }}
        >
          Nuevo cliente
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>
      )}

      {loading ? (
        <Center h={200}><Loader /></Center>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Redirect URI</Table.Th>
              <Table.Th>Client Secret</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clients.map((client) => (
              <Table.Tr key={client.id}>
                <Table.Td>
                  <Badge variant="light" color="orange">{client.id}</Badge>
                </Table.Td>
                <Table.Td>{client.clientName}</Table.Td>
                <Table.Td>
                  <Code>{client.redirectUri}</Code>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Code style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.clientSecret}
                    </Code>
                    <CopyButton value={client.clientSecret} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copiado' : 'Copiar secret'}>
                          <ActionIcon variant="subtle" onClick={copy}>
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Editar">
                      <ActionIcon variant="subtle" onClick={() => openEdit(client)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Regenerar secret">
                      <ActionIcon variant="subtle" color="orange" onClick={() => handleRegenerate(client.id)}>
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(client.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cliente OAuth' : 'Nuevo cliente OAuth'}
        centered
      >
        {formError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{formError}</Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Nombre de la app"
            placeholder="Torneito"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            mb="sm"
            required
            minLength={2}
          />
          <TextInput
            label="Redirect URI"
            placeholder="http://localhost:4000/callback"
            value={formUri}
            onChange={(e) => setFormUri(e.target.value)}
            mb="lg"
            required
          />
          <Button
            type="submit"
            fullWidth
            loading={formLoading}
            style={{ background: '#f5a705', color: '#1a1200' }}
          >
            {editing ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </form>
      </Modal>
    </Box>
  );
}