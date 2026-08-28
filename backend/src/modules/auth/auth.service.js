import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../../config/supabase.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

const PROFILE_COLUMNS = 'id, email, full_name, role, created_at';

function signToken(profile) {
  return jwt.sign({ sub: profile.id, role: profile.role }, env.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

export async function registerUser({ email, password, fullName, role }) {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (lookupError) throw ApiError.internal(lookupError.message);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({ email, password_hash: passwordHash, full_name: fullName, role })
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw ApiError.internal(error.message);

  return data;
}

export async function loginUser({ email, password }) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select(`${PROFILE_COLUMNS}, password_hash`)
    .eq('email', email)
    .maybeSingle();
  if (error) throw ApiError.internal(error.message);
  // Same "invalid email or password" for both a missing account and a wrong
  // password — never reveal which one it was.
  if (!profile) throw ApiError.unauthorized('Invalid email or password');

  const isValid = await bcrypt.compare(password, profile.password_hash);
  if (!isValid) throw ApiError.unauthorized('Invalid email or password');

  const { password_hash: _unused, ...safeProfile } = profile;
  return { token: signToken(safeProfile), user: safeProfile };
}

export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).single();
  if (error || !data) throw ApiError.notFound('Profile not found');
  return data;
}
