-- Remove all translation keys for the deprecated audiochat namespace
DELETE FROM translations WHERE namespace = 'audiochat';
