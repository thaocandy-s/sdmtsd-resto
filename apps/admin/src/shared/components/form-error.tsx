// Inline error banner for admin forms — renders nothing when there is no message.
export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2">
      {message}
    </div>
  );
}
