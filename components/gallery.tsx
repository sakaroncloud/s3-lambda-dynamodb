"use client";
import { useTransition } from "react";
import Uploader from "./uploader";
import { LoaderCircle, X } from "lucide-react";
import { deleteS3Object } from "@/app/actions/s3.action";
import toast from "react-hot-toast";
import { Image } from "@heroui/image";
import { useFetch } from "@/hooks/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@heroui/skeleton";

export const Gallery = () => {
  const { data, isFetching } = useFetch();

  return (
    <>
      <div className="after:content relative col-span-1  flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:pt-0">
        <Uploader />
      </div>
      {isFetching &&
        Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={index}
            className="flex rounded-lg w-full h-80 bg-gray-600/30"
          />
        ))}
      {!isFetching &&
        data?.map((item) => {
          return (
            <div
              key={item.image_id}
              className="w-full shadow-xl rounded-xl relative"
            >
              <Image
                isBlurred
                alt="HeroUI Fruit Image with Zoom"
                src={item.s3_url}
                width={400}
              />
              <DeleteIcon image_id={item.image_id} user_id={item.user_id} />
            </div>
          );
        })}
    </>
  );
};
type TDeleteProps = {
  image_id: string;
  user_id: string;
};
const DeleteIcon = ({ user_id, image_id }: TDeleteProps) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const handleDelete = async () => {
    startTransition(async () => {
      if (isPending) return;
      const res = await deleteS3Object(user_id, image_id);
      if (res?.success) {
        await queryClient.invalidateQueries({ queryKey: ["images"] });
        await queryClient.refetchQueries({ queryKey: ["images"] });
      }
      if (res?.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <div
      onClick={handleDelete}
      className=" bg-red-600/80 z-50 rounded text-white text-xs p-1 absolute top-2 right-1 cursor-pointer"
    >
      {!isPending ? (
        <X className="size-4" />
      ) : (
        <LoaderCircle className="size-4" />
      )}
    </div>
  );
};
