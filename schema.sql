CREATE TABLE IF NOT EXISTS artists(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  photo TEXT,
  bio TEXT,
  links TEXT
);
CREATE TABLE IF NOT EXISTS versus(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round TEXT NOT NULL,
  artist_a INTEGER NOT NULL REFERENCES artists(id),
  artist_b INTEGER NOT NULL REFERENCES artists(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('draft','open','paused','closed')),
  starts_at INTEGER,
  ends_at INTEGER,
  show_results TEXT NOT NULL DEFAULT 'live' CHECK(show_results IN('live','after'))
);
CREATE TABLE IF NOT EXISTS votes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  versus_id INTEGER NOT NULL REFERENCES versus(id),
  side TEXT NOT NULL CHECK(side IN('a','b')),
  voter_hash TEXT NOT NULL,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(versus_id,voter_hash)
);
CREATE INDEX IF NOT EXISTS idx_votes_versus ON votes(versus_id);
INSERT OR IGNORE INTO artists(slug,name,photo) VALUES
('dopelym','DOPELYM','/img/artistes/dopelym.jpg'),
('jeune-lion','JEUNE LION','/img/artistes/jeune-lion.jpg'),
('og-mahilet','OG MAHILET','/img/artistes/og-mahilet.jpg'),
('wantche','WANTCHE','/img/artistes/wantche.jpg');
INSERT INTO versus(round,artist_a,artist_b,status,show_results)
SELECT 'Finale',a.id,b.id,'open','live'
FROM artists a JOIN artists b ON a.slug='dopelym' AND b.slug='wantche'
WHERE NOT EXISTS(
  SELECT 1 FROM versus v WHERE v.round='Finale' AND v.artist_a=a.id AND v.artist_b=b.id
);
