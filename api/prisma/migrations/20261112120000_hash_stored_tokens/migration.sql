-- Existing JWTs contain dots, while SHA-256 hex digests do not.
START TRANSACTION;

UPDATE `sessions`
SET `refresh_token` = SHA2(`refresh_token`, 256)
WHERE `refresh_token` LIKE '%.%';

UPDATE `activation_tokens`
SET `token` = SHA2(`token`, 256)
WHERE `token` LIKE '%.%';

COMMIT;
