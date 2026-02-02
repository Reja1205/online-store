"use client";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminSecret: "",
    isAdmin: false,
  });

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = form.isAdmin
      ? `${base}/api/auth/register-admin`
      : `${base}/api/auth/register-user`;

    const body = form.isAdmin
      ? {
          name: form.name,
          email: form.email,
          password: form.password,
          adminSecret: form.adminSecret,
        }
      : {
          name: form.name,
          email: form.email,
          password: form.password,
        };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration successful");
      window.location.href = "/login";
    } else {
      alert(data.message || "Error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />
        <br />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <br />

        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
        />
        <br />

        <label>
          <input
            type="checkbox"
            name="isAdmin"
            onChange={handleChange}
          />
          Register as Admin
        </label>

        {form.isAdmin && (
          <>
            <br />
            <input
              name="adminSecret"
              placeholder="Admin Secret"
              onChange={handleChange}
            />
          </>
        )}

        <br />
        <button type="submit">Register</button>
      </form>

      <br />
      <a href="/">Back</a>
    </div>
  );
}