// src/utils/auth.js
export const login = (username, password) => {
  // Simulação de login (em produção: chame API)
  if (username === "admin" && password === "123456") {
    localStorage.setItem("user", JSON.stringify({ username }));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};
