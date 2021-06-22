import { useState } from "react";
import { useEffect } from "react";

// TODO confirm this works
export default function useHistory(): History {
  const [history, setHistory] = useState<History>(window.history);
  useEffect(() => {
    // update history state when window history changes
    setHistory(window.history);
  }, []);
  return history;
}
