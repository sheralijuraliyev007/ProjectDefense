import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Input, Button } from "@heroui/react";

export function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <Navbar maxWidth="xl">
      <NavbarBrand>
        <Button variant="light" onPress={() => navigate("/")}>
          CV Platform
        </Button>
      </NavbarBrand>

      <NavbarContent as="form" onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search..."
          size="sm"
        />
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button variant="light" onPress={() => navigate("/positions")}>
            Positions
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button variant="light" onPress={() => navigate("/profile")}>
            Profile
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}