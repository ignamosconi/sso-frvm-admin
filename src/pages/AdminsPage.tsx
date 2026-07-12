import { useEffect, useState } from 'react';
import {
  Box, Title, Text, Button, Table, ActionIcon, Group,
  Modal, TextInput, PasswordInput, Alert, Loader, Center,
} from '@mantine/core';
import { IconPlus, IconTrash, IconEdit, IconAlertCircle } from '@tabler/icons-react';
import { adminsApi } from '@/api/adminApi';
import { AdminResponse, CreateAdminPayload, UpdateAdminPayload } from '@/types/api.types';

export function AdminsPage() {
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminResponse | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setAdmins(await adminsApi.findAll());
    } catch {
      setError('Error al cargar los administradores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormUsername('');
    setFormPassword('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (admin: AdminResponse) => {
    setEditing(admin);
    setFormUsername(admin.username);
    setFormPassword('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (editing) {
        const payload: UpdateAdminPayload = {};
        if (formUsername !== editing.username) payload.username = formUsername;
        if (formPassword) payload.password = formPassword;
        await adminsApi.update(editing.id, payload);
      } else {
        const payload: CreateAdminPayload = { username: formUsername, password: formPassword };
        await adminsApi.create(payload);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Error al guardar.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminár este administrador?')) return;
    try {
      await adminsApi.remove(id);
      load();
    } catch {
      setError('Error al eliminar el administrador.');
    }
  };

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} mb={4}>Administradores</Title>
          <Text c="dimmed" size="sm">Gestioná los usuarios con acceso al panel.</Text>
        </Box>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          style={{ background: '#f5a705', color: '#1a1200' }}
        >
          Nuevo admin
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
              <Table.Th>Usuario</Table.Th>
              <Table.Th>Creado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {admins.map((admin) => (
              <Table.Tr key={admin.id}>
                <Table.Td>{admin.username}</Table.Td>
                <Table.Td>{new Date(admin.createdAt).toLocaleDateString('es-AR')}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" onClick={() => openEdit(admin)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(admin.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
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
        title={editing ? 'Editar administrador' : 'Nuevo administrador'}
        centered
      >
        {formError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{formError}</Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Usuario"
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value)}
            mb="sm"
            required
            minLength={3}
          />
          <PasswordInput
            label={editing ? 'Nueva contraseña (dejá vacío para no cambiar)' : 'Contraseña'}
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            mb="lg"
            required={!editing}
            minLength={8}
          />
          <Button
            type="submit"
            fullWidth
            loading={formLoading}
            style={{ background: '#f5a705', color: '#1a1200' }}
          >
            {editing ? 'Guardar cambios' : 'Crear administrador'}
          </Button>
        </form>
      </Modal>
    </Box>
  );
}