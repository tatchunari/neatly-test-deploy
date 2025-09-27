import Layout from "@/components/admin/Layout";

import { useState } from "react";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { CreateRoomForm } from "@/components/admin/roomForm/CreateRoomForm";


export default function CreateRoomPage() {

  const [isLoading, setIsLoading] = useState(false);
  
// console.log("Gallery URLs:",galleryUrls);
 if (isLoading) {
    return (
      <Layout>
        <LoadingScreen/>
      </Layout>
    );
  }

  return (
      <CreateRoomForm/>
  );
}