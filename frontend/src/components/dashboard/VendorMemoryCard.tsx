type Props = {
  vendorMemory: any;
};

export default function VendorMemoryCard({ vendorMemory }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">
        Vendor Memory
      </h2>

      <div className="space-y-4">

        <div>
          <p className="text-sm text-slate-500">
            Known Vendor
          </p>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              vendorMemory?.known_vendor
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {vendorMemory?.known_vendor ? "Yes" : "No"}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Previous Invoices
          </p>

          <p className="text-2xl font-bold">
            {vendorMemory?.history?.invoice_count ?? 0}
          </p>
        </div>

      </div>
    </div>
  );
}