
ALTER TABLE public.cleaners
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS payment_details text;

-- Backfill payment_details from existing pix_key (if any)
UPDATE public.cleaners
   SET payment_details = pix_key
 WHERE payment_details IS NULL AND pix_key IS NOT NULL AND pix_key <> '';

-- For existing rows with a pix_key, mark them as 'pix' by default
UPDATE public.cleaners
   SET payment_method = 'pix'
 WHERE payment_method = 'other' AND pix_key IS NOT NULL AND pix_key <> '';
