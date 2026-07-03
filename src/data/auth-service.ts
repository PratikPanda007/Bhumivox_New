const API_URL = "https://localhost:7077/api/auth";

export type PublicUser = {
  userId: number;
  userGuid: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  avatar: string;
};

type LoginResponse = {
  success: boolean;
  token: string;
  user: PublicUser;
};

type RegisterResponse = {
  success: boolean;
  message: string;
  userId: number;
  userGuid: string;
  roleId: number;
};

const SESSION_KEY = "bhumivox.session";

export const authService = {
  async getCurrentUser(): Promise<PublicUser | null> {
    const token = localStorage.getItem("jwt");

    if (!token) return null;

    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    return JSON.parse(raw) as PublicUser;
  },

  async login(email: string, password: string): Promise<PublicUser> {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Invalid email or password.");
    }

    localStorage.setItem("jwt", data.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));

    return data.user;
  },

  async signup(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<PublicUser> {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: input.name,
        email: input.email,
        phone: input.phone,
        password: input.password,
        avatar: "",
      }),
    });

    const data: RegisterResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Registration failed.");
    }

    // Automatically log in after successful registration
    return await this.login(input.email, input.password);
  },

  async logout(): Promise<void> {
    localStorage.removeItem("jwt");
    localStorage.removeItem(SESSION_KEY);
  },

  async updateProfile(
    userId: number,
    patch: { fullName?: string; phone?: string; avatar?: string },
  ): Promise<PublicUser> {
    throw new Error("Update profile API not implemented yet.");
  },

  async changePassword(current: string, next: string): Promise<void> {
    throw new Error("Change password API not implemented yet.");
  },
};
