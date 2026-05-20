-- Tablas necesarias para la API de boletas
-- La fuente de verdad es prisma/schema.prisma; este archivo refleja el mismo modelo
-- para inicializar Supabase manualmente cuando no se ejecuta `prisma migrate`.

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  game_type text NOT NULL,
  game_number text,
  game_date timestamptz NOT NULL,
  amount numeric(12, 2),
  place text,
  status text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_user_id_game_date_idx ON tickets (user_id, game_date);
CREATE INDEX IF NOT EXISTS tickets_user_id_status_idx ON tickets (user_id, status);
CREATE INDEX IF NOT EXISTS tickets_user_id_game_type_idx ON tickets (user_id, game_type);
