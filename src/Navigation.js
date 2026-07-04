// Minimal, dependency-free stack navigator built on React state.
// Avoids native navigation modules for maximum release stability.
// Exposes navigate / replace / goBack / reset via a hook.
import React, { createContext, useContext, useCallback, useMemo, useState } from "react";

const NavContext = createContext(null);

export function NavigationProvider({ initialRoute, children }) {
  const [stack, setStack] = useState([
    { name: initialRoute || "Home", params: {}, key: "0" },
  ]);

  const navigate = useCallback((name, params) => {
    setStack((prev) => [
      ...prev,
      { name, params: params || {}, key: String(prev.length) + "_" + Date.now() },
    ]);
  }, []);

  const replace = useCallback((name, params) => {
    setStack((prev) => {
      const next = prev.slice(0, Math.max(0, prev.length - 1));
      next.push({
        name,
        params: params || {},
        key: String(next.length) + "_" + Date.now(),
      });
      return next.length ? next : [{ name, params: params || {}, key: "0" }];
    });
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  }, []);

  const reset = useCallback((name, params) => {
    setStack([{ name, params: params || {}, key: "0_" + Date.now() }]);
  }, []);

  const current = stack[stack.length - 1] || { name: "Home", params: {} };
  const canGoBack = stack.length > 1;

  const value = useMemo(
    () => ({ navigate, replace, goBack, reset, current, canGoBack, stackDepth: stack.length }),
    [navigate, replace, goBack, reset, current, canGoBack, stack.length]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavContext);
  if (!ctx) {
    return {
      navigate: () => {},
      replace: () => {},
      goBack: () => {},
      reset: () => {},
      current: { name: "Home", params: {} },
      canGoBack: false,
      stackDepth: 1,
    };
  }
  return ctx;
}
