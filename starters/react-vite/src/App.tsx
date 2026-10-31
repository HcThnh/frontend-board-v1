import { useState } from "react";
import { configured } from "./api";
import { BoardPage } from "./components/Board/BoardPage";

export default function App() {
  const [_selectedId, setSelectedId] = useState<number | null>(null);

  if (!configured()) {
    return (
      <p>
        Save <code>HELPDESK_URL</code> and <code>HELPDESK_TOKEN</code> in{" "}
        <code>.env</code>, then restart <code>npm run dev</code>.
      </p>
    );
  }

  return (
    <BoardPage
      onSelectRequest={(id) => setSelectedId(id)}
    />
  );
}
