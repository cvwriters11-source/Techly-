"use client";

export function ConfirmDeleteForm({
  action,
  recordId,
  label,
  ariaLabel,
  confirmMessage,
  description,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  recordId: string;
  label: string;
  ariaLabel?: string;
  confirmMessage: string;
  description?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onClick={(event) => event.stopPropagation()}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="recordId" value={recordId} />
      {description ? (
        <p className="text-sm text-white/55">{description}</p>
      ) : null}
      <button
        type="submit"
        aria-label={ariaLabel ?? label}
        className={
          description
            ? "mt-4 text-sm text-red-300 transition hover:text-red-200"
            : "text-xs font-medium text-red-300 transition hover:text-red-200"
        }
      >
        {label}
      </button>
    </form>
  );
}
