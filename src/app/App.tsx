import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ProProvider } from "./contexts/ProContext";

export default function App() {
  return (
    <ProProvider>
      <RouterProvider router={router} />
    </ProProvider>
  );
}
