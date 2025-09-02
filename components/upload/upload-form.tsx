'use client';

import { z } from "zod";
import UploadFormInput from "./upload-form-input";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";
import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useUser } from '@clerk/nextjs';

// The schema can stay the same
const schema = z.object({
    file: z.instanceof(globalThis.File, { message: 'Invalid file' })
        .refine((file) => file.size <= 20 * 1024 * 1024,
            'File size must be less than 20MB'
        )
        .refine(
            (file) => file.type === 'application/pdf' || file.type === 'application/x-pdf',
            'File must be a PDF'
        ), 
});

export default function UploadForm() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const { user } = useUser();
    const [isLoading, setLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const { startUpload } = useUploadThing("pdfUploader", {
        onClientUploadComplete: () => {
            console.log("uploaded successfully!");
        },
        onUploadError: (err) => {
            console.error("error occurred while uploading", err);
            toast("Error occurred while uploading");
        },
        onUploadBegin: (fileName) => {  // ✅ Fixed: parameter is just a string
            console.log("upload has begun for", fileName);
        },
    });

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (!user) {
                toast("Please sign in to upload PDFs");
                setLoading(false);
                return;
            }

            try {
                const creditResponse = await axios.post('/api/usePdfCredit', {
                    userEmail: user.emailAddresses[0]?.emailAddress
                });

                if (!creditResponse.data.success) {
                    toast(creditResponse.data.error);
                    setShowUpgradeModal(true);
                    setLoading(false);
                    return;
                }

                if (!creditResponse.data.isUnlimited && creditResponse.data.message) {
                    toast(creditResponse.data.message);
                }

            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 403) {
                    toast("You've reached your monthly PDF limit. Please upgrade to Pro plan.");
                    setShowUpgradeModal(true);
                    setLoading(false);
                    return;
                } else {
                    toast("Error checking subscription status. Please try again.");
                    setLoading(false);
                    return;
                }
            }

            if (!file) {
                toast('Please select a PDF file to upload.');
                setLoading(false);
                return;
            }

            const validatedFields = schema.safeParse({ file });

            if (!validatedFields.success) {
                toast(validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file');
                setLoading(false);
                return;
            }

            toast('Uploading PDF');
            const resp = await startUpload([file]);
            
            // ✅ Fixed: Proper array length checking
            if (!resp || resp.length === 0) {
                toast('Please use a different File');
                setLoading(false);
                return;
            }

            toast('Processing PDF');

            // ✅ Fixed: Type assertion to match expected tuple type
            const typedResp = resp as unknown as [{
                serverData: {
                    userId: string;
                    file: { url: string; name: string; };
                };
            }];

            const result = await generatePdfSummary(typedResp);
            const { data = null } = result || {};

            if (data) {
                let storeResult: any;
                toast('Saving PDF...');

                if(data.summary) {
                    storeResult = await storePdfSummaryAction({
                        summary: data.summary,
                        fileUrl: resp[0].serverData.file.url,
                        title: data.title,
                        fileName: file.name,
                    })

                    if (storeResult.success && storeResult.data?.id) {
                        toast('Your PDF has been successfully summarized and saved');
                        formRef.current?.reset();
                        setFile(null);
                        router.push(`/summaries/${storeResult.data.id}`);
                    } else {
                        console.error('Store result error:', storeResult);
                        toast('Error saving PDF summary. Please try again.');
                    }
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
            <UploadFormInput 
                isLoading={isLoading} 
                ref={formRef} 
                onSubmit={handleSubmit} 
                onFileChange={handleFileChange} 
            />
            
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md mx-4">
                        <h3 className="text-lg font-bold mb-4 text-rose-600">Upgrade Required</h3>
                        <p className="mb-4 text-gray-700">
                            You've reached your monthly PDF limit. Please upgrade to Pro plan for unlimited PDF summaries.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowUpgradeModal(false);
                                    const pricingSection = document.getElementById('pricing');
                                    if (pricingSection) {
                                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:from-rose-600 hover:to-rose-700 transition-all"
                            >
                                Upgrade Now
                            </button>
                            <button 
                                onClick={() => setShowUpgradeModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-all"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
