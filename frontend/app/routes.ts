import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("forms", "routes/forms.tsx"),
  route("forms/new", "routes/forms.new.tsx"),
  route("forms/:id", "routes/forms.$id.tsx"),
  route("forms/:id/edit", "routes/forms.$id.edit.tsx"),
] satisfies RouteConfig;
