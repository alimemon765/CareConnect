export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="rounded-full animate-spin"
        style={{
          width: 32,
          height: 32,
          border: '3px solid #E5E7EB',
          borderTopColor: '#FFB800',
        }}
      />
    </div>
  );
}
