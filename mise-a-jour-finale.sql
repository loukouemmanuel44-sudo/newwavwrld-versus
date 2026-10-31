-- Passage des deux demi-finales à la finale.
-- Les votes déjà enregistrés restent conservés dans la table votes.
UPDATE versus
SET status='closed'
WHERE round='Demi finale' AND status='open';

-- Ajoute le duel final une seule fois : DOPELYM contre WANTCHE.
INSERT INTO versus(round,artist_a,artist_b,status,show_results)
SELECT 'Finale',a.id,b.id,'open','live'
FROM artists a JOIN artists b ON a.slug='dopelym' AND b.slug='wantche'
WHERE NOT EXISTS(
  SELECT 1 FROM versus v WHERE v.round='Finale' AND v.artist_a=a.id AND v.artist_b=b.id
);
