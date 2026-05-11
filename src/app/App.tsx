import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ProProvider } from "./contexts/ProContext";
import { DashboardProvider } from "./contexts/DashboardContext";

export default function App() {
  return (
    <ProProvider>
      <DashboardProvider>
        <RouterProvider router={router} />
      </DashboardProvider>
    </ProProvider>
  );
}
