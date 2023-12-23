import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";
import App from "./components/App";
import { store } from "./services/store";
import * as Spotlight from "@spotlightjs/spotlight";

// only load Spotlight in dev
if (process.env.NODE_ENV === "development") {
  Spotlight.init();
}

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    </Router>
  </React.StrictMode>,
);
