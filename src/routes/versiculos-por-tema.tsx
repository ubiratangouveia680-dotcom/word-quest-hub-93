import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/versiculos-por-tema")({ component: () => <Outlet /> });