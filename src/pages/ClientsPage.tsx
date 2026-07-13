import { useEffect, useState } from 'react';
import {
  Box, Title, Text, Button, ActionIcon, Group, Modal,
  TextInput, Alert, Loader, Center, Badge, CopyButton,
  Tooltip, Code, Card, Stack, Divider,
  Select, Pagination,
} from '@mantine/core';
import {
  IconPlus, IconTrash, IconEdit, IconAlertCircle,
  IconRefresh, IconCopy, IconCheck, IconChevronDown,
  IconChevronUp, IconMail, IconSearch, IconX,
} from '@tabler/icons-react';
import { oauthClientsApi } from '@/api/adminApi';
import {
  OAuthClientResponse, CreateOAuthClientPayload, UpdateOAuthClientPayload,
} from '@/types/api.types';

const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50'];

function TruncatedCopy({ value, maxWidth = 200 }: { value: string; maxWidth?: number }) {
  return (
    <Group gap={4} wrap="nowrap">
      <Code
        style={{
          maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
      >
        {value}
      </Code>
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copiado' : 'Copiar'}>
            <ActionIcon variant="subtle" size="sm" onClick={copy}>
              {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}

interface ClientCardProps {
  client: OAuthClientResponse;
  isOpen: boolean;
  onToggle: (id: number) => void;
  onEdit: (client: OAuthClientResponse) => void;
  onDelete: (id: number) => void;
  onRegenerate: (id: number) => void;
  onEmail: (client: OAuthClientResponse) => void;
}

function ClientCard({ client, isOpen, onToggle, onEdit, onDelete, onRegenerate, onEmail }: ClientCardProps) {
  return (
    <Card withBorder radius="md" p="md" mb="sm">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Badge variant="light" color="orange" size="sm">{client.id}</Badge>
          <Text fw={600} size="sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {client.clientName}
          </Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Enviar credenciales por email">
            <ActionIcon variant="subtle" color="blue" onClick={() => onEmail(client)}>
              <IconMail size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar">
            <ActionIcon variant="subtle" onClick={() => onEdit(client)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Regenerar secret">
            <ActionIcon variant="subtle" color="orange" onClick={() => onRegenerate(client.id)}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar">
            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(client.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon variant="subtle" onClick={() => onToggle(client.id)}>
            {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>
      </Group>

      {isOpen && (
        <>
          <Divider my="sm" />
          <Stack gap="xs">
            <Box>
              <Text size="xs" c="dimmed" mb={4}>Redirect URIs</Text>
              {client.redirectUris.map(uri => (
                <TruncatedCopy key={uri} value={uri} maxWidth={320} />
              ))}
            </Box>
            <Box>
              <Text size="xs" c="dimmed" mb={4}>Client Secret</Text>
              <TruncatedCopy value={client.clientSecret} maxWidth={320} />
            </Box>
            <Text size="xs" c="dimmed">
              Creado: {new Date(client.createdAt).toLocaleDateString('es-AR')}
            </Text>
          </Stack>
        </>
      )}
    </Card>
  );
}

export function ClientsPage() {
  const [clients, setClients] = useState<OAuthClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de expansión por id — vive en el padre para sobrevivir a recargas
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<OAuthClientResponse | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [editing, setEditing] = useState<OAuthClientResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formUris, setFormUris] = useState<string[]>(['']);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchUri, setSearchUri] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const toggleOpen = (id: number) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormUris(['']);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (client: OAuthClientResponse) => {
    setEditing(client);
    setFormName(client.clientName);
    setFormUris(client.redirectUris.length ? client.redirectUris : ['']);
    setFormError(null);
    setModalOpen(true);
  };

  const openEmail = (client: OAuthClientResponse) => {
    setEmailTarget(client);
    setEmailAddress('');
    setEmailError(null);
    setEmailSuccess(false);
    setEmailModalOpen(true);
  };

  const handleUriChange = (index: number, value: string) => {
    setFormUris(uris => uris.map((u, i) => i === index ? value : u));
  };

  const addUri = () => {
    if (formUris.length < 5) setFormUris(u => [...u, '']);
  };

  const removeUri = (index: number) => {
    if (formUris.length > 1) setFormUris(u => u.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const cleanUris = formUris.map(u => u.trim()).filter(Boolean);
    if (cleanUris.length === 0) {
      setFormError('Agregá al menos una redirect URI.');
      setFormLoading(false);
      return;
    }
    try {
      if (editing) {
        const payload: UpdateOAuthClientPayload = {};
        if (formName !== editing.clientName) payload.clientName = formName;
        if (JSON.stringify(cleanUris) !== JSON.stringify(editing.redirectUris)) payload.redirectUris = cleanUris;
        await oauthClientsApi.update(editing.id, payload);
      } else {
        const payload: CreateOAuthClientPayload = { clientName: formName, redirectUris: cleanUris };
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
      setOpenIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      load();
    } catch {
      setError('Error al eliminar el cliente.');
    }
  };

  const handleRegenerate = async (id: number) => {
    if (!confirm('¿Regenerar el client secret? El anterior quedará invalidado inmediatamente.')) return;
    try {
      const updated = await oauthClientsApi.regenerateSecret(id);
      // Actualizamos solo el cliente afectado sin recargar toda la lista
      // así los estados de expansión se preservan
      setClients(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      setError('Error al regenerar el secret.');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget) return;
    setEmailError(null);
    setEmailLoading(true);
    try {
      await oauthClientsApi.sendCredentialsByEmail(emailTarget.id, emailAddress);
      setEmailSuccess(true);
    } catch (err: any) {
      setEmailError(err?.response?.data?.message ?? 'Error al enviar el email.');
    } finally {
      setEmailLoading(false);
    }
  };

  const filtered = clients.filter(c => {
    const matchName = c.clientName.toLowerCase().includes(search.toLowerCase());
    const matchId = searchId ? String(c.id).includes(searchId) : true;
    const matchUri = searchUri
      ? c.redirectUris.some(u => u.toLowerCase().includes(searchUri.toLowerCase()))
      : true;
    return matchName && matchId && matchUri;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

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

      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>}

      <Group mb="md" align="flex-end" wrap="wrap" gap="sm">
        <TextInput
          placeholder="Buscar por nombre..."
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          w={200}
        />
        <TextInput
          placeholder="Buscar por ID..."
          leftSection={<IconSearch size={14} />}
          value={searchId}
          onChange={(e) => { setSearchId(e.target.value); setPage(1); }}
          w={140}
        />
        <TextInput
          placeholder="Buscar por URI..."
          leftSection={<IconSearch size={14} />}
          value={searchUri}
          onChange={(e) => { setSearchUri(e.target.value); setPage(1); }}
          w={220}
        />
        <Select
          data={PAGE_SIZE_OPTIONS}
          value={String(pageSize)}
          onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
          w={100}
          label="Por página"
        />
      </Group>

      {loading ? (
        <Center h={200}><Loader /></Center>
      ) : (
        <>
          {paginated.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              isOpen={openIds.has(client.id)}
              onToggle={toggleOpen}
              onEdit={openEdit}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              onEmail={openEmail}
            />
          ))}
          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Group>
        </>
      )}

      {/* Modal crear/editar */}
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
          <Text size="sm" fw={500} mb={4}>
            Redirect URIs <Text span c="dimmed" size="xs">(máximo 5)</Text>
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Podés agregar URLs de desarrollo (localhost) y de producción.
          </Text>
          <Stack gap="xs" mb="sm">
            {formUris.map((uri, i) => (
              <Group key={i} gap="xs" wrap="nowrap">
                <TextInput
                  placeholder={i === 0 ? 'http://localhost:4000/callback' : 'https://miapp.com/callback'}
                  value={uri}
                  onChange={(e) => handleUriChange(i, e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                {formUris.length > 1 && (
                  <ActionIcon variant="subtle" color="red" onClick={() => removeUri(i)}>
                    <IconX size={14} />
                  </ActionIcon>
                )}
              </Group>
            ))}
          </Stack>
          {formUris.length < 5 && (
            <Button variant="subtle" size="xs" onClick={addUri} mb="lg" leftSection={<IconPlus size={12} />}>
              Agregar URI
            </Button>
          )}
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

      {/* Modal email */}
      <Modal
        opened={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title={`Enviar credenciales — ${emailTarget?.clientName}`}
        centered
      >
        {emailError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{emailError}</Alert>
        )}
        {emailSuccess ? (
          <Alert icon={<IconCheck size={16} />} color="green" radius="md">
            Credenciales enviadas correctamente a <strong>{emailAddress}</strong>.
          </Alert>
        ) : (
          <form onSubmit={handleSendEmail}>
            <TextInput
              label="Destinatario"
              placeholder="desarrollador@frvm.utn.edu.ar"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              mb="lg"
              required
              type="email"
            />
            <Button
              type="submit"
              fullWidth
              loading={emailLoading}
              style={{ background: '#f5a705', color: '#1a1200' }}
            >
              Enviar credenciales
            </Button>
          </form>
        )}
      </Modal>
    </Box>
  );
}