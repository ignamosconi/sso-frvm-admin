import { useEffect, useState } from 'react';
import {
  Box, Title, Text, Table, ActionIcon, Group,
  Alert, Loader, Center, TextInput,
  Pagination, Select,
} from '@mantine/core';
import { IconTrash, IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { adminsApi } from '@/api/adminApi';
import { AdminResponse } from '@/types/api.types';
import { useAuthStore } from '@/store/authStore';

const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50'];

export function AdminListPage() {
  const { adminId } = useAuthStore();
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este administrador?')) return;
    try {
      await adminsApi.remove(id);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al eliminar.');
    }
  };

  const filtered = admins.filter(a =>
    a.username.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Box>
      <Title order={2} mb={4}>Lista de administradores</Title>
      <Text c="dimmed" size="sm" mb="xl">Todos los admins del sistema. Solo podés eliminar admins que no seas vos.</Text>

      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>}

      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Buscar por usuario..."
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          w={260}
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
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Usuario</Table.Th>
                <Table.Th>Creado</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginated.map((admin) => (
                <Table.Tr key={admin.id}>
                  <Table.Td>{admin.username}</Table.Td>
                  <Table.Td>{new Date(admin.createdAt).toLocaleDateString('es-AR')}</Table.Td>
                  <Table.Td>
                    {admin.id !== adminId && (
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(admin.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Group>
        </>
      )}
    </Box>
  );
}