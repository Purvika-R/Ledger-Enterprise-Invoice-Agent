type Props = {
  header: any;
};

export default function HeaderCard({ header }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-semibold">
        Invoice Header
      </h2>

      <div className="space-y-4">

        <div>
          <p className="text-sm text-slate-500">
            Invoice Number
          </p>

          <p className="font-medium">
            {header.invoice_number || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Vendor
          </p>

          <p className="font-medium">
            {header.vendor || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Invoice Date
          </p>

          <p className="font-medium">
            {header.invoice_date || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Currency
          </p>

          <p className="font-medium">
            {header.currency || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Total Amount
          </p>

          <p className="font-semibold text-lg text-blue-600">
            {header.total_amount || "-"}
          </p>
        </div>

      </div>
    </div>
  );
}