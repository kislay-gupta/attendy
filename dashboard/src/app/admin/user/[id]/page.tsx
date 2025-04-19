import UserCard from "@/components/user/UserCard";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-6">
      <UserCard id={id} />
    </div>
  );
}
