"use client";
import Link from "next/link";

const reservoirs = ["Bewl", "Darwell", "Powdermill", "Weir Wood"];

export default function SouthernWaterPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 mt-24">
      <h1 className="text-4xl lg:text-5xl font-bold text-center">Southern Water Reservoirs</h1>
      <ul className="grid md:grid-cols-2 gap-4 text-center">
        {reservoirs.map((r) => (
          <li key={r} className="p-6 border rounded-lg hover:bg-gray-50">
            <Link href={`/southernwater/${r}`}>{r}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
