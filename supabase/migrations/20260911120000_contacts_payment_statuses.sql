-- Expand contact workflow statuses for payment tracking and client retention.
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_status_check;
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'new'::text,
        'contacted'::text,
        'closed'::text,
        'deposit_paid'::text,
        'paid_in_full'::text
      ]
    )
  );
