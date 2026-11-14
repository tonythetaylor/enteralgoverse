export function StatusBadge({ state }: { state: "coming-soon" | "released" }) {
  return (
    <span
      className={
        state === "coming-soon" ? "badge badge-dim" : "badge badge-bright"
      }
    >
      {state === "released" ? "FEATURED EPISODE" : "COMING SOON"}
    </span>
  );
}
