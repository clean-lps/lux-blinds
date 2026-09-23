export type InitialAdminConfig = {
  email: string;
  password: string;
  name: string;
};

type Environment = Record<string, string | undefined>;

/**
 * Returns no configuration after the first successful bootstrap. Supplying
 * only one credential is always an error so a production deploy cannot create
 * an unreachable or weak administrator account.
 */
export function getInitialAdminConfig(environment: Environment = process.env): InitialAdminConfig | null {
  const rawEmail = environment.INITIAL_ADMIN_EMAIL?.trim();
  const password = environment.INITIAL_ADMIN_PASSWORD;

  if (!rawEmail && !password) return null;
  if (!rawEmail) throw new Error('INITIAL_ADMIN_EMAIL is required when bootstrapping an administrator.');
  if (!password) throw new Error('INITIAL_ADMIN_PASSWORD is required when bootstrapping an administrator.');
  if (!/^\S+@\S+\.\S+$/.test(rawEmail)) throw new Error('INITIAL_ADMIN_EMAIL must be a valid email address.');
  if (password.length < 12) throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters long.');

  return {
    email: rawEmail.toLowerCase(),
    password,
    name: environment.INITIAL_ADMIN_NAME?.trim() || 'Administrator',
  };
}
