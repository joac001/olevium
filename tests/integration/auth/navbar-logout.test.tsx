import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import NavBar from "@/components/layout/NavBar";
import { useAuthStore } from "@/lib/stores/auth";

const routerReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: routerReplace,
  }),
  usePathname: () => "/accounts",
}));

const showSuccess = vi.fn();
const showError = vi.fn();

vi.mock("@/context/NotificationContext", () => ({
  useNotification: () => ({
    showSuccess,
    showError,
  }),
}));

vi.mock("@/lib/hoc/withAuth", () => ({
  withAuth:
    <P extends object>(Component: React.ComponentType<P>) =>
    (props: P) =>
      <Component {...props} />,
}));

const logoutMock = vi.fn().mockResolvedValue(undefined);
const originalLogout = useAuthStore.getState().logout;

beforeEach(() => {
  useAuthStore.setState(state => ({
    ...state,
    logout: logoutMock,
  }));
});

afterEach(() => {
  useAuthStore.setState(state => ({
    ...state,
    logout: originalLogout,
  }));
  vi.clearAllMocks();
});

describe("NavBar logout", () => {
  it("llama a logout, muestra feedback y redirige al login", async () => {
    render(<NavBar title="Test" links={[]} />);

    const logoutButton = screen.getByRole("button", {
      name: /cerrar sesión/i,
    });

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(showSuccess).toHaveBeenCalled();
      expect(routerReplace).toHaveBeenCalledWith("/auth");
    });
  });
});

