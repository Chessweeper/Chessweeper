import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Client } from "./components/Client";
import { Home } from "./components/home/Home";
import { HowToPlay } from "./components/home/HowToPlay";
import { setupStore } from "./store";
import "./styles/globals.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/play",
    element: <Client />,
  },
  {
    path: "/howtoplay",
    element: <HowToPlay />,
  },
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={setupStore()}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
