import Layout from "@/components/admin/Layout";

import { useRouter } from "next/router";
import { useQuery } from "@/hooks/useQuery";

import LoadingScreen from "@/components/admin/LoadingScreen";
import { EditRoomForm } from "@/components/admin/roomForm/EditRoomForm";

export default function EditRoomRoute() {
  const router = useRouter();
  const roomId = router.query.id;

  if (!roomId) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  return <EditRoomPage id={roomId} />;
}

function EditRoomPage({ id }) {
  const { data: roomResponse, error, loading } = useQuery(`/api/rooms/${id}`);
  if (loading) {
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
