// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">📦 Your Orders</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{order.email}</p>
              <p className="text-sm text-gray-500">
                ${order.amount} • {order.status}
              </p>
            </div>
            {order.deliverableUrl ? (
              <a
                href={order.deliverableUrl}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Download
              </a>
            ) : (
              <span className="text-gray-400 text-sm">Processing...</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
