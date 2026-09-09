"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Leaf } from "lucide-react";

export default function ConnexionPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { pseudo } },
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await supabase
          .from("profiles")
          .upsert({ id: data.user.id, pseudo });
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  }

  return (
    <div className="px-4 pt-10 pb-24">
      <div className="flex items-center gap-2 mb-8 justify-center">
        <Leaf className="text-moss-dark" size={24} />
        <h1 className="font-display text-2xl text-moss-dark">Béb Eco</h1>
      </div>

      <div className="flex bg-[#EFEAE0] rounded-full p-1 mb-6">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-full text-sm font-medium ${
            mode === "login" ? "bg-white text-ink" : "text-[#8A8477]"
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-full text-sm font-medium ${
            mode === "signup" ? "bg-white text-ink" : "text-[#8A8477]"
          }`}
        >
          Inscription
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <Field label="Pseudo affiché">
            <input
              required
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="input"
              placeholder="ex : Claire M."
            />
          </Field>
        )}
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Mot de passe">
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-moss-dark text-white rounded-full py-3 font-medium mt-2 disabled:opacity-60"
        >
          {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          background: white;
          border: 1px solid #e7e1d2;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
        }
        .input:focus {
          border-color: #5e7a52;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[12px] text-[#8A8477] block mb-1">{label}</span>
      {children}
    </label>
  );
}
