"use client";

import React from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTrigger,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
    children: React.ReactNode;
    onUpload: (file: File) => Promise<{ success: boolean }>;
    aspect?: number;
    maxSizeMB?: number;
    acceptedTypes?: string[];
}

export function AvatarUploader({
    children,
    onUpload,
    aspect = 1,
    maxSizeMB = 20,
    acceptedTypes = ["jpeg", "jpg", "png", "webp"],
}: Props) {
    const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState<number>(1);
    const [isPending, setIsPending] = React.useState<boolean>(false);
    const [photo, setPhoto] = React.useState<{ url: string; file: File | null }>({
        url: "",
        file: null,
    });
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
        null
    );
    const [open, onOpenChange] = React.useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img_ext = file.name.substring(file.name.lastIndexOf(".") + 1);
        const validExt = acceptedTypes.includes(img_ext.toLowerCase());

        if (!validExt) {
            toast.error("Selected file is not a supported image type");
            return;
        }

        if (parseFloat(String(file.size)) / (1024 * 1024) >= maxSizeMB) {
            toast.error(`Image must be smaller than ${maxSizeMB}MB`);
            return;
        }

        setPhoto({ url: URL.createObjectURL(file), file });
    };

    const handleCropComplete = (_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleUpdate = async () => {
        if (photo?.file && croppedAreaPixels) {
            setIsPending(true);
            try {
                const croppedImg = await getCroppedImg(photo?.url, croppedAreaPixels);
                if (!croppedImg || !croppedImg.file) {
                    throw new Error("Failed to crop image");
                }

                const file = new File(
                    [croppedImg.file],
                    "avatar.jpeg",
                    {
                        type: "image/jpeg",
                    }
                );

                const result = await onUpload(file);
                if (result.success) {
                    setPhoto({ url: "", file: null });
                    onOpenChange(false);
                    toast.success("Avatar updated successfully!");
                }
            } catch (error) {
                toast.error("Failed to update avatar");
                console.error(error);
            } finally {
                setIsPending(false);
            }
        } else {
            toast.error("No image selected for upload");
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            drawerProps={{
                dismissible: photo?.file ? false : true,
            }}
        >
            <ModalTrigger asChild>{children}</ModalTrigger>
            <ModalContent className="h-max md:max-w-md">
                <ModalHeader>
                    <ModalTitle>Upload Avatar</ModalTitle>
                </ModalHeader>
                <ModalBody className="space-y-4">
                    <Input
                        disabled={isPending}
                        onChange={handleFileChange}
                        type="file"
                        accept="image/*"
                        className="bg-[#0a0a0a] border-neutral-700 text-white file:text-neutral-400"
                    />
                    {photo?.file && (
                        <div className="bg-neutral-900 relative aspect-square w-full overflow-hidden rounded-lg">
                            <Cropper
                                image={photo.url}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                                classes={{
                                    containerClassName: isPending
                                        ? "opacity-80 pointer-events-none"
                                        : "",
                                }}
                            />
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className="grid w-full grid-cols-2 gap-2">
                    <Button
                        className="w-full"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="w-full bg-white text-black hover:bg-neutral-200"
                        type="button"
                        onClick={handleUpdate}
                        disabled={isPending || !photo.file}
                    >
                        {isPending ? "Uploading..." : "Update"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

function getRadianAngle(degreeValue: number): number {
    return (degreeValue * Math.PI) / 180;
}

function rotateSize(
    width: number,
    height: number,
    rotation: number
): { width: number; height: number } {
    const rotRad = getRadianAngle(rotation);

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

type Flip = {
    horizontal: boolean;
    vertical: boolean;
};

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip: Flip = { horizontal: false, vertical: false }
): Promise<{ url: string; file: Blob | null } | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to create 2D context");
    }

    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // Limit the output size to 512x512 for avatars
    const maxSize = 512;
    const scale = Math.min(maxSize / pixelCrop.width, maxSize / pixelCrop.height, 1);
    const outputWidth = Math.round(pixelCrop.width * scale);
    const outputHeight = Math.round(pixelCrop.height * scale);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Create a temp canvas for the cropped region
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = pixelCrop.width;
    tempCanvas.height = pixelCrop.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
        tempCtx.putImageData(data, 0, 0);
    }

    // Draw scaled image to output canvas
    ctx.drawImage(tempCanvas, 0, 0, outputWidth, outputHeight);

    return new Promise((resolve, reject) => {
        // Use JPEG format with 85% quality for smaller file size
        canvas.toBlob((file) => {
            if (!file) {
                reject(new Error("Failed to generate cropped image blob"));
                return;
            }
            console.log(`Cropped avatar size: ${(file.size / 1024).toFixed(2)}KB`);
            resolve({
                url: URL.createObjectURL(file),
                file,
            });
        }, "image/jpeg", 0.85);
    });
}
