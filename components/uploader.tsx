"use client";
import { getUploadUrl, uploadObject } from "@/app/actions/s3.action";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import Lambda from "@/public/assets/lambda.png";
import Dynamo from "@/public/assets/dynamo.png";
import S3 from "@/public/assets/s3.png";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

export default function Uploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  function reset() {
    setIsUploading(false);
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      toast.error("No file selected");
      return;
    }
    setIsUploading(true);
    try {
      const uploadPermission = await getUploadUrl(file.type);
      if (uploadPermission?.error) {
        toast.error(uploadPermission.error);
      }
      if (uploadPermission?.signedUrl) {
        const uploadFile = await uploadObject(uploadPermission.signedUrl, file);
        if (uploadFile?.error) {
          toast.error(uploadFile.error);
        }
        if (uploadFile?.success) {
          await queryClient.invalidateQueries({ queryKey: ["images"] });
          await queryClient.refetchQueries({ queryKey: ["images"] });
          toast.success(uploadFile.success);
          setFile(null);
          setPreview(null);
          router.refresh();
        }
      }
    } catch {
      toast.error("Something went wrong");
    }

    setIsUploading(false);
  }

  function handleFileChange(file: File) {
    toast.dismiss();

    if (file.type.split("/")[0] !== "image") {
      toast.error("We only accept image files");
      return;
    }

    if (file.size / 1024 / 1024 > 1) {
      toast.error("File size too big (max 1MB)");
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form
      className="w-full flex flex-col items-center justify-center h-full gap-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl text-white">Upload Your Image to S3</h2>
      <div className="w-full">
        <label
          htmlFor="image-upload"
          className="group relative mt-2 flex h-52 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-600 shadow-sm transition-all "
        >
          <div
            className="absolute z-[5] h-full w-full rounded-md"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);

              const file = e.dataTransfer?.files?.[0];
              if (file) {
                handleFileChange(file);
              }
            }}
          />
          <div
            className={`${
              dragActive ? "border-2 border-black" : ""
            } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all ${
              preview
                ? "bg-gray-900/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md"
                : " opacity-100 hover:bg-gray-900"
            }`}
          >
            <svg
              className={`${
                dragActive ? "scale-110" : "scale-100"
              } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Upload icon</title>
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m16 16-4-4-4 4" />
            </svg>
            <p className="mt-2 text-center text-sm text-gray-500">
              Drag and drop or click to upload.
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Max file size: 1MB
            </p>
            <span className="sr-only">Photo upload</span>
          </div>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- We want a simple preview here, no <Image> needed
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded-md object-cover"
            />
          )}
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            id="image-upload"
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.currentTarget?.files?.[0];
              if (file) {
                handleFileChange(file);
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full">
        <button
          type="reset"
          onClick={reset}
          disabled={isUploading || !file}
          className="bg-transparent border-blue-600 text-blue-600  hover:text-white disabled:cursor-not-allowed disabled:border-gray-600  flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isUploading || !file}
          className="border-black text-white bg-blue-600 hover:bg-blue-700  disabled:cursor-not-allowed disabled:border-gray-600  flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
        >
          <p className="text-sm">Upload</p>
        </button>
      </div>
      <div>
        <div className="italic text-gray-400 text-sm space-y-2">
          <div>Technologies Used</div>

          <div className="flex items-center gap-2">
            <Image
              src={S3}
              height={40}
              width={40}
              alt="S3 icon"
              className="rounded"
            />
            <Image
              src={Lambda}
              height={40}
              width={40}
              alt="Lambda icon"
              className="rounded"
            />
            <Image
              src={Dynamo}
              height={40}
              width={40}
              alt="DynamoDb icon"
              className="rounded"
            />
          </div>
          <p className="text-orange-500">Reload if no changes are seen</p>
        </div>
      </div>
    </form>
  );
}
