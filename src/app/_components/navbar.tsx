import NavbarClient from "./navbar-client";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-card px-4 py-3">
      <NavbarClient />
    </nav>
  );
}
