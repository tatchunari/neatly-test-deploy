import Layout from "@/components/admin/Layout";

import { useRouter } from "next/router";
import { useQuery } from "@/hooks/useQuery";

import LoadingScreen from "@/components/admin/LoadingScreen";
import { EditRoomForm } from "@/components/admin/roomForm/EditRoomForm";
import { Room } from "@/types/rooms";

export default function EditRoomRoute() {
  const router = useRouter();
  const roomId = router.query.id as string;

  if (!roomId) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  return <EditRoomPage id={roomId} />;
}

function EditRoomPage({ id }: {id: string}) {
  const { data: roomResponse, error, loading } = useQuery<{ data: Room}>(`/api/rooms/${id}`);
  if (loading || !roomResponse?.data) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  return (
  <EditRoomForm room={roomResponse?.data} />
  )
}
