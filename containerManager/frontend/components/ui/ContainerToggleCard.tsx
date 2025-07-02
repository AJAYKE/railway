import { Button } from "@/components/ui/button";

type Props = {
  status: string;
  loading: boolean;
  onCreate: () => void;
  onDelete: () => void;
};

export default function ContainerToggleCard({
  status,
  loading,
  onCreate,
  onDelete,
}: Props) {
  return (
    <div className="border rounded-2xl p-6 shadow-xl text-center space-y-4">
      <h2 className="text-xl font-semibold">Container Status</h2>
      <p className="text-lg">{status}</p>
      <div className="space-x-2">
        <Button disabled={loading} onClick={onCreate}>
          Create
        </Button>
        <Button variant="destructive" disabled={loading} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
