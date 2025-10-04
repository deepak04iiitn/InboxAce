export { default } from "next-auth/middleware";

// Protect specific template routes
export const config = { 
  matcher: [
    "/templates/create",
    "/templates/my-templates",
    "/templates/:id/edit",
  ] 
};
