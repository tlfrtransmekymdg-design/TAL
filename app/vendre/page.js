"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { CATEGORIES, CONDITIONS } from "@/lib/categories";
import { Camera, X } from "lucide-react";

export default function VendrePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0].id,
    condition: "bon",
    price: "",
    city: "",
    desc: "",
  });
  const [photos, setPhotos] = useState([]); // URLs déjà en ligne (mode édition)
  const [newFiles, setNewFiles] = useState([]); // fichiers à uploader
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!editId) return;
    supabase
      .from("listings")
      .select("*")
      .eq("id", editId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setForm({
          title: data.title,
          category: data.category,
          condition: data.condition,
          price: data.price,
          city: data.city,
          desc: data.description || "",
        });
        setPhotos(data.photos || []);
      });
  }, [editId]);

  function handleFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 3 - (photos.length + newFiles.length));
    setNewFiles((prev) => [...prev, ...files]);
  }

  function removeExistingPhoto(url) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }
  function removeNewFile(idx) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadPhotos() {
    const urls = [];
    for (const file of newFiles) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      router.push("/connexion");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const uploaded = await uploadPhotos();
      const allPhotos = [...photos, ...uploaded];

      const payload = {
        title: form.title,
        category: form.category,
        condition: form.condition,
        price: Number(form.price),
        city: form.city,
        description: form.desc,
        photos: allPhotos,
        seller_id: user.id,
        status: "active",
      };

      if (editId) {
        const { error: upErr } = await supabase
          .from("listings")
          .update(payload)
          .eq("id", editId)
          .eq("seller_id", user.id);
        if (upErr) throw upErr;
        router.push(`/annonce/${editId}`);
      } else {
        const { data, error: insErr } = await supabase
          .from("listings")
          .insert(payload)
          .select()
          .single();
        if (insErr) throw insErr;
        router.push(`/annonce/${data.id}`);
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  const totalPhotos = photos.length + newFiles.length;

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-display text-xl text-moss-dark mb-1">
        {editId ? "Modifier l'annonce" : "Déposer une annonce"}
      </h1>
      <p className="text-[13px] text-[#8A8477] mb-5">
        Donnez une seconde vie aux articles de bébé et d'enfant.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[12px] text-[#8A8477] block mb-1">Photos (3 max)</label>
          <div className="flex gap-2">
            {photos.map((url) => (
              <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E7E1D2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E7E1D2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {totalPhotos < 3 && (
              <label className="w-20 h-20 rounded-xl border border-dashed border-[#C9C2AF] flex items-center justify-center text-[#B0A996] cursor-pointer">
                <Camera size={20} />
                <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
              </label>
            )}
          </div>
        </div>

        <Field label="Titre de l'annonce">
          <input
            required
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ex : Poussette canne pliage 1 main"
          />
        </Field>

        <Field label="Catégorie">
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="État">
          <select
            className="input"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          >
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prix (€)">
            <input
              required
              type="number"
              min="0"
              step="0.5"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
          <Field label="Ville">
            <input
              required
              className="input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            required
            rows={4}
            className="input"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            placeholder="État, dimensions, raison de la vente…"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={saving}
          className="w-full bg-moss-dark text-white rounded-full py-3 font-medium disabled:opacity-60"
        >
          {saving ? "Publication…" : editId ? "Enregistrer" : "Publier l'annonce"}
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
