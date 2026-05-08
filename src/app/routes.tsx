import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Stats } from "./pages/Stats";
import { Settings } from "./pages/Settings";
import { Orders } from "./pages/Orders";
import { Board } from "./pages/Board";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "orders", Component: Orders },
      { path: "board", Component: Board },
      { path: "stats", Component: Stats },
      { path: "settings", Component: Settings },
    ],
  },
]);
