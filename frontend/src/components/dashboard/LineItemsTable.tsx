type Props = {
  items: any[];
};

export default function LineItemsTable({ items }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-semibold">
        Invoice Line Items
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">

          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3">
                  {item.description}
                </td>

                <td className="p-3 text-center">
                  {item.quantity}
                </td>

                <td className="p-3 text-right">
                  {item.unit_price}
                </td>

                <td className="p-3 text-right font-medium">
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}