"use client";

import { FormEvent, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-white/[0.08] bg-ink-950/80 px-4 py-3.5 text-sm text-white outline-none placeholder:text-ink-500 transition focus:border-gold/40 focus:ring-1 focus:ring-gold/30";

const labelClass = "mb-1.5 block text-sm font-medium text-ink-300";

export default function ContactForm() {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, ownerName, email, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      setSuccess(true);
      setBusinessName("");
      setOwnerName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
          <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-semibold text-white">
          Request received!
        </h3>
        <p className="mt-2 text-sm text-ink-400">
          We&apos;ll reach out shortly to schedule your personalized demo.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-medium text-gold hover:text-gold-light"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="businessName" className={labelClass}>
          Business Name
        </label>
        <input
          id="businessName"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className={inputClass}
          placeholder="Joe's Garage & Tire"
        />
      </div>
      <div>
        <label htmlFor="ownerName" className={labelClass}>
          Owner Name
        </label>
        <input
          id="ownerName"
          required
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className={inputClass}
          placeholder="Joe Martinez"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="joe@joegarage.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gold py-4 text-sm font-bold text-ink-950 shadow-glow transition hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Sending..." : "Request Demo"}
      </button>
    </form>
  );
}
