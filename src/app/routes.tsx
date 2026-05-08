import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Reports } from "./pages/Reports";
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
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
