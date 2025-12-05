const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(cod_empleado: string, password: string) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
        cod_empleado,
        password
    })
  });
  if (!response.ok) {
    throw new Error("Error al iniciar sesión");
  }

  const data = await response.json();

  localStorage.setItem("token", data.token);
  localStorage.setItem("nombre", data.user.nombre);
  localStorage.setItem("puesto", data.user.puesto)

  return data;
}