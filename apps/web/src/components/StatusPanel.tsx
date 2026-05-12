interface Props {
  title: string;
  result: unknown;
  error?: string | null;
}

export function StatusPanel({ title, result, error }: Props) {
  if (!result && !error) return null;

  return (
    <div
      style={{
        marginTop: "0.75rem",
        padding: "0.75rem",
        background: error ? "#fdedec" : "#eafaf1",
        borderRadius: "6px",
        fontSize: "0.8rem",
        overflowX: "auto",
      }}
    >
      <strong>{title}:</strong>
      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      {Boolean(result) && <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
