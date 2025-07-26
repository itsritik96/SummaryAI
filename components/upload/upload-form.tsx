'use client';

import { z } from "zod";
import UploadFormInput from "./upload-form-input";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner"
import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";


const schema = z.object({
    file: z.instanceof(globalThis.File, { message: 'Invalid file' })
        .refine((file) => file.size <= 20 * 1024 * 1024,
            'File size must be less than 20MB'
        )
        .refine(
            (file) => file.type.startsWith('application/pdf'),
            'File must be a PDF'
        ),
});

export default function UploadForm() {

    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isLoading, setLoading] = useState(false);

    const { startUpload } = useUploadThing("pdfUploader", {
        onClientUploadComplete: () => {
            console.log("uploaded successfully!");
        },
        onUploadError: (err) => {
            console.error("error occurred while uploading", err);
            toast("Error occurred while uploading");
        },
        onUploadBegin: ({ file }) => {
            console.log("upload has begun for", file);
        },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
        
            const formData = new FormData(e.currentTarget);
            const file = formData.get('file') as File;

            const validatedFields = schema.safeParse({ file });

            if (!validatedFields.success) {
                toast(validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file');
                setLoading(false);
                return;
            }

            toast('Uploading PDF');
            const resp = await startUpload([file]);
            
            if (!resp) {
                toast('Please use a different File');
                setLoading(false);
                return;
            }

            toast('Processing PDF');
            const result = await generatePdfSummary(resp);
            const { data = null } = result || {};
            console.log("before reach");

            if (data) {
                console.log("reach")
                let storeResult: any;
                toast('Saving PDF...');

            if(data.summary) {
                storeResult = await storePdfSummaryAction({
                    summary: data.summary,
                    fileUrl: resp[0].serverData.file.url,
                    title: data.title,
                    fileName: file.name,
                })
                toast('Your PDF has been successfully summarized and saved')

                formRef.current?.reset();
                router.push('/summaries/${storeResult.data.id}');
            }
        }
        } catch (error) {
            setLoading(false);
            console.error('Error occurred', error);
            formRef.current?.reset();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
            <UploadFormInput isLoading={isLoading} ref={formRef} onSubmit={handleSubmit} />
        </div>
    );
}