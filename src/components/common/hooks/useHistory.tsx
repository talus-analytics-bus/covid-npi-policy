import { useState, useEffect } from "react";

export default function useHistory(): History {
  const [history, setHistory] = useState<History>(window.history);
  useEffect(() => {
    // update history state when window history changes
    setHistory(window.history);
  }, []);
  return history;
}
