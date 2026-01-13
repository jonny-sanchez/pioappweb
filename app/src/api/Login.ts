const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(cod_empleado: string, password: string) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cod_empleado, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("rol", data.user.rol);
  localStorage.setItem("nombre", data.user.nombre);
  localStorage.setItem("puesto", data.user.puesto);
  if(data.user.email === null ) {
    localStorage.setItem("email", "0");
  } else {
    localStorage.setItem("email", "1");
  }
  localStorage.setItem("division", data.user.division);

  return data;
}