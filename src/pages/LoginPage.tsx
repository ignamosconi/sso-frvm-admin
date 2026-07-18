import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, TextInput, PasswordInput, Button,
  Text, Title, Alert, Group, Image, PinInput,
  Stack, Divider, CopyButton, Tooltip, ActionIcon,
  Code,
} from '@mantine/core';
import {
  IconAlertCircle, IconShieldCheck, IconCopy, IconCheck,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import logoUtn from '@/assets/logo-utn.png';
import type { Admin2faSetupResponse } from '@/types/api.types';

// Máquina de estados del login
type LoginStep =
  | 'credentials'   // paso 1: usuario + password
  | 'setup_2fa'     // paso 2a: primera vez — mostrar QR y confirmar
  | 'validate_2fa'; // paso 2b: logins posteriores — ingresar código

export function LoginPage() {
  const { loginStep1, setup2fa, confirm2fa, validate2fa } = useAuth();
  const { isAuthenticated, pendingToken } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [setupData, setSetupData] = useState<Admin2faSetupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // ── Paso 1: credenciales ──────────────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await loginStep1(username, password);
      if (response.requires_2fa_setup) {
        // Primera vez — pedir QR al backend
        const qrData = await setup2fa(response.pending_token);
        setSetupData(qrData);
        setStep('setup_2fa');
      } else {
        // Ya tiene 2FA configurado
        setStep('validate_2fa');
      }
    } catch {
      setError('Credenciales inválidas. Verificá tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 2a: confirmar primer código TOTP (setup) ─────────────────────────
  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) { setError('Sesión expirada. Volvé a ingresar tus credenciales.'); setStep('credentials'); return; }
    setError(null);
    setLoading(true);
    try {
      await confirm2fa(pendingToken, totpCode);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Código incorrecto. Verificá que el autenticador esté sincronizado.');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 2b: validar código TOTP (logins posteriores) ────────────────────
  const handleValidate2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) { setError('Sesión expirada. Volvé a ingresar tus credenciales.'); setStep('credentials'); return; }
    setError(null);
    setLoading(true);
    try {
      await validate2fa(pendingToken, totpCode);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Código incorrecto. Intentá de nuevo.');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setStep('credentials');
    setTotpCode('');
    setSetupData(null);
    setError(null);
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
      <Card withBorder shadow="sm" radius="md" w={step === 'setup_2fa' ? 480 : 360} p="xl">
        <Group justify="space-between" align="center" mb="xs">
          <Group gap="xs">
            <Image src={logoUtn} w={32} h={32} fit="contain" />
            <Text fw={600} size="sm">UTN FRVM</Text>
          </Group>
          <ThemeToggle />
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="md">
            {error}
          </Alert>
        )}

        {/* ── Step 1: Credenciales ── */}
        {step === 'credentials' && (
          <>
            <Title order={2} mb={4}>Iniciar sesión</Title>
            <Text size="sm" c="dimmed" mb="lg">Panel de administración del SSO</Text>
            <form onSubmit={handleCredentials}>
              <TextInput
                label="Usuario"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                mb="sm"
                required
                autoComplete="username"
              />
              <PasswordInput
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                mb="lg"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                loading={loading}
                style={{ background: '#f5a705', color: '#1a1200' }}
              >
                Continuar
              </Button>
            </form>
          </>
        )}

        {/* ── Step 2a: Setup 2FA (primera vez) ── */}
        {step === 'setup_2fa' && setupData && (
          <>
            <Title order={2} mb={4}>Configurar autenticador</Title>
            <Text size="sm" c="dimmed" mb="md">
              Es la primera vez que iniciás sesión. Necesitás vincular una app de autenticación.
            </Text>

            <Alert icon={<IconShieldCheck size={16} />} color="orange" mb="md" radius="md">
              <Text size="sm" fw={500}>
                Descargá <strong>Google Authenticator</strong> en tu celular antes de continuar.
              </Text>
            </Alert>

            <Stack gap="md" mb="md">
              <Box>
                <Text size="sm" fw={500} mb="xs">1. Escaneá este código QR con la app</Text>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <img
                    src={setupData.qrCodeDataUrl}
                    alt="Código QR para autenticador"
                    style={{ width: 180, height: 180 }}
                  />
                </Box>
              </Box>

              <Box>
                <Text size="sm" fw={500} mb={4}>
                  2. Si no podés escanear el QR, ingresá este código manualmente
                </Text>
                <Group gap="xs" align="center">
                  <Code
                    style={{
                      flex: 1,
                      letterSpacing: '0.1em',
                      fontSize: 13,
                      padding: '6px 10px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {setupData.manualEntrySecret}
                  </Code>
                  <CopyButton value={setupData.manualEntrySecret} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copiado' : 'Copiar'}>
                        <ActionIcon variant="subtle" onClick={copy} size="lg">
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Box>
            </Stack>

            <Divider mb="md" />

            <form onSubmit={handleConfirm2fa}>
              <Text size="sm" fw={500} mb="xs">3. Ingresá el código de 6 dígitos que genera la app</Text>
              <Group justify="center" mb="lg">
                <PinInput
                  length={6}
                  type="number"
                  value={totpCode}
                  onChange={setTotpCode}
                  placeholder="○"
                  size="lg"
                  oneTimeCode
                />
              </Group>
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={totpCode.length !== 6}
                style={{ background: '#f5a705', color: '#1a1200' }}
                mb="xs"
              >
                Activar autenticador e ingresar
              </Button>
              <Button variant="subtle" fullWidth size="xs" onClick={goBackToCredentials}>
                Volver a credenciales
              </Button>
            </form>
          </>
        )}

        {/* ── Step 2b: Validar 2FA (logins posteriores) ── */}
        {step === 'validate_2fa' && (
          <>
            <Title order={2} mb={4}>Verificación en dos pasos</Title>
            <Text size="sm" c="dimmed" mb="lg">
              Ingresá el código de 6 dígitos de tu app autenticadora.
            </Text>
            <form onSubmit={handleValidate2fa}>
              <Group justify="center" mb="lg">
                <PinInput
                  length={6}
                  type="number"
                  value={totpCode}
                  onChange={setTotpCode}
                  placeholder="○"
                  size="lg"
                  oneTimeCode
                />
              </Group>
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={totpCode.length !== 6}
                style={{ background: '#f5a705', color: '#1a1200' }}
                mb="xs"
              >
                Verificar e ingresar
              </Button>
              <Button variant="subtle" fullWidth size="xs" onClick={goBackToCredentials}>
                Volver a credenciales
              </Button>
            </form>
          </>
        )}
      </Card>
    </Box>
  );
}