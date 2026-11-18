type Props = {
  title: string;
  value: any;
};

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-paper p-6 rounded-3xl border border-ink/10">
      <p className="text-ink/60 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}