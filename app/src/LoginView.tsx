import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import logo from "@/assets/img/LOGOPINULITOORIGINAL.png";
import { login } from "./api/Login";

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if(!localStorage.getItem("token")){
      return
    } else {
      onLogin();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login(username, password);

      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcb900] to-[#e5a700] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl mb-4">
            <Image
              src={logo}
              width={85}
              height={90}
              alt="Logo Pinulito"
              loading="eager"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <h1 className="text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="username" className="text-gray-900 mb-2">Código de Empleado</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su código"
              className="bg-white border-gray-300 h-12 focus:border-[red] focus:ring-[red] text-gray-900"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-900 mb-2">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="bg-white border-gray-300 h-12 focus:border-[red] focus:ring-[red] text-gray-900"
            />
          </div> 
          <Button
            type="submit"
            className="w-full bg-red-600 text-white border border-transparent hover:bg-white hover:text-red-600 hover:border-red-600 h-12 mt-6"
          >
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}