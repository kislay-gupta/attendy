import AttendanceCalender from "@/components/shared/AttendaceCalender";
import UserCard from "@/components/user/UserCard";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container flex  mx-auto p-6">
      <div className="flex-3/4">
        <UserCard id={id} />
      </div>
      <div className="flex-1/3">
        <AttendanceCalender id={id} />
      </div>
    </div>
  );
}
