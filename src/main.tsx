import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const basename = import.meta.env.VITE_APP_BASE || "/";

// Nginx/Chrome Trusted Types compatibility:
// If your CSP includes `require-trusted-types-for 'script'`, any dependency that
// assigns to `element.innerHTML` will throw unless a Trusted Types policy exists.
// Creating the `default` policy allows string-to-TrustedHTML conversion.
try {
  const tt = (window as any).trustedTypes;
  if (tt?.createPolicy) {
    tt.createPolicy("default", {
      createHTML: (input: string) => input,
      createScript: (input: string) => input,
      createScriptURL: (input: string) => input,
    });
  }
} catch {
  // noop
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);
